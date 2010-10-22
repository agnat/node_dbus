var transport  = require('./transport')
  , util       = require('util')
  , Buffer     = require('buffer').Buffer
  ;

var Connection = exports.Connection = function Connection(address) {
  this.address = address;
}

var initital_zero = new Buffer(1);
initital_zero[0] = 0;

Connection.prototype.open = function(address, callback) {
  var self = this;
  address(function(error, address) {
    if (error) throw error;
    self.transport = transport.create(address, callback);
  });
}

process.on('SIGPIPE', function() {
  console.log('broken pipe: water in drive /dev/sda');
});
