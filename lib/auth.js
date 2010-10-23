var hex  = require('./hex')
  , util = require('util')
  ;

var Buffer = require('buffer').Buffer
  , EventEmitter = require('events').EventEmitter
  ;

var all_mechanisms = [
  {
    name: "NO_SUCH_MECH"
  , client: {
      initial_response: function() { return { state: 'OK', response: ''} }
    }
  },
  require('./auth/external')
];

function requires_send_auth() {}

Auth = function(stream, auth_client) {
  var self = this;
  EventEmitter.call(this);
  self._stream = stream;
  self._auth_client = auth_client;
  self._incoming = "";
  self._server_mechs = null;
  self._mech_idx = 0;

  self.goto_state(requires_send_auth);

  stream.on('data', function(d) { self.handle_data(d) } );

  self._mech = all_mechanisms[self._mech_idx];

  self.send_auth();
}
util.inherits(Auth, EventEmitter);

Auth.prototype.handle_data = function(d) {
  var self = this;
  self._incoming += d.toString('utf8');
  var end = self._incoming.indexOf('\r\n');
  if (end != -1) { // TODO: loop?
    var line = self._incoming.substr(0, end);
    console.log('S: ' + line);
    self._incoming = "";

    var cmd_end = line.indexOf(' ');
    var cmd = line.substr(0, cmd_end);
    var cmd_data = line.substr(cmd_end + 1);

    self._state_handler(cmd, cmd_data);
  } else if (self._incoming.length > 10000) {
    self.disconnect("disconnect due to excesive buffering in auth phase");
  }
}

Auth.prototype.send_auth = function() {
  var cmd = "AUTH " + this._mech.name;
  var mech_result;
  if ('initial_response' in this._mech.client) {
    mech_result = this._mech.client.initial_response(this);
    if ('response' in mech_result) {
      cmd += " " + mech_result.response;
    }
  }
  cmd += "\r\n";
  console.log("C: " + cmd.trim());

  this._stream.write(new Buffer(cmd));
  switch (mech_result.state) {
    case 'OK':
      this.goto_state(this.waiting_for_ok);
      break;
    case 'CONTINUE':
      this.goto_state(this.waiting_for_data);
      break;
    case 'ERROR':
      console.log('auth mech returned ERROR');
      break;
  }
}

Auth.prototype.process_rejected = function(args) {
  if ( ! this._server_mechs ) {
    this._server_mechs = args.split(' ');
    console.log(this._server_mechs);
  }

  this.goto_state(requires_send_auth);

  this._mech_idx += 1;

  while (this._mech_idx < all_mechanisms.length) {
    var m = all_mechanisms[this._mech_idx];
    if (this._server_mechs.length > 0) {
      if (this._server_mechs.indexOf(m.name) != -1) {
        this._mech = m;
        break;
      }
    } else {
      this._mech = m;
      break;
    }
    this._mech_idx += 1;
  }
  
  if (this._mech_idx === all_mechanisms.length) {
    this._mech = undefined;
    this.disconnect("failed to aggree on an authentication mechanism");
  } else {
    this.send_auth();
  }
}

Auth.prototype.process_ok = function(args_from_ok) {
  if ( ! hex.isHex(args_from_ok)) {
    this.disconnect("string is not hex encoded");
  }
  this._auth_client.server_guid = args_from_ok;
  this.send_begin();
}

Auth.prototype.send_begin = function(args_from_ok) {
  this._stream.write(new Buffer("BEGIN\r\n"));
  this.goto_state(this.is_authenticated);
  this.emit('authenticated');
}

Auth.prototype.send_cancel = function() {
  this._stream.write(new Buffer("CANCEL\r\n"));
  this.goto_state(this.waiting_for_reject);
}

Auth.prototype.disconnect = function(error_message) {
  this._stream.close();
  this.emit('error', new Error(error_message));
}

Auth.prototype.goto_state = function(handler_func) {
  console.log("=== "
      + (this._state_handler ? this._state_handler.name + " -> " : "INITIAL: ")
      + handler_func.name);
  this._state_handler = handler_func;
}

//=== State Handlers ==========================================================

Auth.prototype.is_authenticated = function is_authenticated() {}

Auth.prototype.waiting_for_data = function waiting_for_data(command, args) {
}

Auth.prototype.waiting_for_ok = function waiting_for_ok(command, args) {
  switch (command) {
    case 'REJECTED':
      this.process_rejected(args);
      break;
    case 'OK':
      this.process_ok(args);
      break;
    case 'DATA':
    case 'ERROR':
      this.send_cancel();
      break;
    default:
      this.send_error("Unknown command '" + command + "'");
  }
}

Auth.prototype.waiting_for_reject = function waiting_for_reject(command, args) {
  switch (command) {
    case 'REJECTED':
      this.process_rejected(args);
      break;
    default:
      this.disconnect("expected REJECT but got " + command);
  }
}

exports.create = function(stream, auth_client) { return new Auth(stream, auth_client); }
