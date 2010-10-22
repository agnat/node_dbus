var hex  = require('./hex')
  , util = require('util')
  ;

var Buffer = require('buffer').Buffer
  , EventEmitter = require('events').EventEmitter
  ;

var all_mechanisms = [
  require('./auth/external')
];

Auth = function(stream, auth_client) {
  var self = this;
  EventEmitter.call(this);
  self._stream = stream;
  self._auth_client = auth_client;
  self._incoming = "";

  self.goto_state(function requires_send_auth() {});

  stream.on('data', function(d) {
    self._incoming += d.toString('utf8');
    var end = self._incoming.indexOf('\r\n')
    if (end != -1) { // TODO: loop?
      var line = self._incoming.substr(0, end);
      console.log('S: ' + line);
      self._incoming = "";

      var cmd_end = line.indexOf(' ');
      var cmd = line.substr(0, cmd_end);
      var cmd_data = line.substr(cmd_end + 1);

      self._state_handler(cmd, cmd_data);
    }
  });

  self._mech = all_mechanisms[0];

  self.send_auth();
}
util.inherits(Auth, EventEmitter);

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
      this.goto_state(this._waiting_for_ok);
      break;
    case 'CONTINUE':
      this.goto_state(this._waiting_for_data);
      break;
    case 'ERROR':
      console.log('auth mech returned ERROR');
      break;
  }
}

Auth.prototype.process_rejected = function(args_from_ok) {
}

Auth.prototype.process_ok = function(args_from_ok) {
  if ( ! hex.isHex(args_from_ok)) {
    // TODO disconnect
    throw Error("string is not hex encoded");
  }
  this._auth_client.server_guid = args_from_ok;
  this.send_begin();
}

Auth.prototype.send_begin = function(args_from_ok) {
  this._stream.write(new Buffer("BEGIN\r\n"))
  this.goto_state(this._is_authenticated);
  this.emit('authenticated');
}

Auth.prototype.goto_state = function(handler_func) {
  console.log("=== "
      + (this._state_handler ? this._state_handler.name + " -> " : "INITIAL: ")
      + handler_func.name);
  this._state_handler = handler_func;
}

//=== State Handlers ==========================================================

Auth.prototype._is_authenticated = function is_authenticated() {}

Auth.prototype._waiting_for_data = function waiting_for_data(command, args) {
}

Auth.prototype._waiting_for_ok = function waiting_for_ok(command, args) {
  switch (command) {
    case 'REJECTED':
      this.process_rejected(args);
      break;
    case 'OK':
      this.process_ok(args);
      break;
      
  }
}

exports.create = function(stream, auth_client) { return new Auth(stream, auth_client); }
