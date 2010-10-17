var transport  = require('./transport')
  , Buffer     = require('buffer').Buffer
  ;

var Connection = exports.Connection = function Connection(address) {
  this.address = address;
  console.log(address);
}

var initital_zero = new Buffer(1);
initital_zero[0] = 0;

Connection.prototype.open = function(address_getter, callback) {
  var self = this;
  address_getter(function(error, address) {
    console.log('got address: ' + address);
  });
}

