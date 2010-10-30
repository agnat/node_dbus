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
  }
, require('./auth/dbus_cookie_sha1')
, require('./auth/external')
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

  stream.on('data', function(d) { self.handle_input(d) } );

  self._mech = all_mechanisms[self._mech_idx];

  self.send_auth();
}
util.inherits(Auth, EventEmitter);
Auth.verbose = false;

Auth.prototype.handle_input = function(d) {
  var self = this;
  self._incoming += d.toString('ascii');
  var end = self._incoming.indexOf('\r\n');
  if (end != -1) { // TODO: loop?
    var line = self._incoming.substr(0, end);
    Auth.log('S: ' + line);
    self._incoming = "";

    var cmd_end = line.indexOf(' ');
    var cmd = line.substr(0, cmd_end);
    var cmd_data = line.substr(cmd_end + 1);

    self._state_handler(cmd, cmd_data);
  } else if (self._incoming.length > 10000) {
    self.disconnect("disconnect due to excesive buffering in auth phase");
  }
}

Auth.prototype.process_ok = function(args_from_ok) {
  if ( ! hex.isHex(args_from_ok)) {
    this.disconnect("string is not hex encoded");
  }
  this._auth_client.server_guid = args_from_ok;
  this.send_begin();
}

Auth.prototype.process_rejected = function(args) {
  if ( ! this._server_mechs ) {
    this._server_mechs = args.split(' ');
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

Auth.prototype.process_data = function(args) {
  var self = this;
  var data = hex.decode(args).toString('ascii');
  hex.isHex(data);
  // TODO: validate ascii
  self._mech.client.data(data, function(d) {
    self.handle_mech_data(d);
  });
}

Auth.prototype.handle_mech_data = function(result) {
  switch (result.state) {
    case 'CONTINUE':
      this.send_data(result.response);
      break;
    case 'OK':
      this.send_data(result.response);
      this.goto_state(this.waiting_for_ok);
      break;
    case 'ERROR':
      this.send_error(result.response);
      break;
  }
}

Auth.prototype.send_auth = function() {
  var mech_result;
  mech_result = this._mech.client.initial_response(this);
  if (mech_result.state == 'ERROR') {
  } else {
    var cmd = "AUTH " + this._mech.name;
    if ('response' in mech_result) {
      cmd += " " + hex.encode(mech_result.response);
    }
    cmd += "\r\n";
    Auth.log("C: " + cmd.trim());

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

  this._stream.write(new Buffer(cmd));
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

Auth.prototype.send_data = function(data) {
  this._stream.write(new Buffer("DATA " + data + "\r\n"));
}

Auth.prototype.disconnect = function(error_message) {
  this._stream.close();
  //this.emit('disconnected', new Error(error_message));
}

Auth.prototype.goto_state = function(handler_func) {
  Auth.log("=== "
      + (this._state_handler ? this._state_handler.name + " -> " : "INITIAL: ")
      + handler_func.name);
  this._state_handler = handler_func;
}

Auth.log = function(msg) {
  if (Auth.verbose) console.log(msg);
}

//=== State Handlers ==========================================================

Auth.prototype.is_authenticated = function is_authenticated() {}

Auth.prototype.waiting_for_data = function waiting_for_data(command, args) {
  switch (command) {
    case 'DATA':
      this.process_data(args);
      break;
    case 'REJECTED':
      this.process_rejected(args);
      break;
    case 'OK':
      this.process_ok(args);
      break;
    case 'ERROR':
      this.send_cancel();
      break;
    default:
      this.send_error("Unknown command");
  }
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
