var util = require('util');

var Auth = require('./auth');

function Transport() {
  var self = this;
  self._auth = new Auth();
}

function UnixDomainSocket() {
  Transport.call(this);
}
util.inherits(UnixDomainSocket, Transport);
