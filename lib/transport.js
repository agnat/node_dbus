var util   = require('util')
  , net    = require('net')
  , auth   = require('./auth')
  , buffer = require('buffer')
  ;


var zero_byte = new buffer.Buffer(1);
zero_byte[0] = 0;

function Transport(callback) {
  var self = this;
  self._stream.on('connect', function() {
    callback();
    self._stream.write(zero_byte);
    self._auth = auth.create(self._stream, this);
  });
  self._stream.on('error', function(error) {
    console.log("stream error: " + error);
  });
  self._stream.on('data', function(data) {
  });
  self._stream.on('end', function() {
    console.log('end');
  });
}

function UnixDomainSocket(address, callback) {
  var path = address.attributes['path'];
  var tmpdir = address.attributes['tmpdir'];
  var abstract_ = address.attributes['abstract'];

  if (tmpdir) {
    throw new Error("cannot use the 'tmpdir' option for an address to connect to");
  }
  if (! path && ! abstract_) {
    throw new Error("'path' or 'abstract' attribute required");
  }
  if ( path && abstract_) {
    throw new Error("can't specify both 'path' and 'abstract' attribute");
  }

  var socket_path;
  if (abstract_) {
    var buffer = new Buffer(abstract_.length + 1);
    console.log("=== abstract " + buffer.length);
    buffer[0] = 0;
    buffer.write(abstract_, 1, 'ascii');
    socket_path = buffer;
  } else {
    socket_path = path;
  }

  this._stream = net.createConnection(socket_path);
  Transport.call(this, callback);
}
util.inherits(UnixDomainSocket, Transport);

function TCPSocket(address, callback) {
  Transport.call(this);
}
util.inherits(TCPSocket, Transport);

exports.create = function(address, callback) {
  var expected_guid = address.attributes['guid'];

  switch (address.transport) {
    case 'tcp':     return new TCPSocket(address, callback);
    case 'unix':    return new UnixDomainSocket(address, callback);
    case 'launchd':
    default:
      throw new Error("unhandled transport protocol '"
          + address.transport + "'");
  }
}
