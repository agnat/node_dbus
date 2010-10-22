var hex = require('../hex');

exports.name = "EXTERNAL";
exports.client = 
  {
    initial_response: function(auth) {
      return {state: 'OK', response: hex.encode(process.getuid().toString()) };
    }
  , data: function(auth) {
    }
  };
