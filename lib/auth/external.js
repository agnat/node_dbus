var hex = require('../hex')
  , resp = require('./response')
  ;

exports.name = "EXTERNAL";
exports.client = 
  {
    initial_response: function(auth) {
      return resp.ok(process.getuid().toString());
    }
  };

exports.sever = undefined;
