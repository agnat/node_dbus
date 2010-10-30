var resp   = require('./response')
  , hex    = require('../hex')
  , fs     = require('fs')
  , util   = require('util')
  , path   = require('path')
  , crypto = require('crypto')
  ;

exports.name = "DBUS_COOKIE_SHA1";
exports.client = {
  initial_response: function() {
      return resp.continue(process.getuid().toString());
  },
  data: function(input, callback) {
    var items = input.split(' ');
    if (items.length !== 3) {
      return resp.error("Server did not send context/ID/challenge properly");
    }
    var context          = items[0]
      , cookie_id        = items[1]
      , server_challenge = items[2]
      ;
    get_cookie_and_random_bytes(context, cookie_id, function(error, cookie, random_bytes) {
      if (error) {
        console.log(error);
        callback(error);
      } else {
        var client_challenge = hex.encodeBuffer(random_bytes);
        var correct_hash = sha1_compute_hash(cookie, server_challenge, client_challenge);
        var response = hex.encode(client_challenge + " " + correct_hash);
        callback(resp.ok(response));
      }
    });
  }
}

function sha1_compute_hash(cookie, server_challenge, client_challenge) {
  var to_hash = server_challenge + ':' + client_challenge + ':' + cookie;
  var hash = crypto.createHash('sha1');
  hash.update(to_hash);
  return hash.digest('hex').toString('ascii');
}

function get_cookie_and_random_bytes(context, cookie_id, callback) {
  var cookie;
  var random_bytes;
  var dispatch = function() {
    if (cookie && random_bytes) callback(null, cookie, random_bytes);
  }
  get_keyring(context, function(error, keyring) {
    if (error) {
      console.log(error);
      callback(resp.error("Failed to get keyring"))
    } else {
      cookie = keyring[cookie_id].secret;
      dispatch();
    }
  });
  get_random_bytes(128/8, function(error, rand) {
    if (error) {
      console.log(error);
      callback(resp.error("Failed to generate random data"));
    } else {
      random_bytes = rand;
      dispatch();
    }
  });
}

function get_keyring(context, callback) {
  var keyring_dir = path.join(process.env['HOME'], ".dbus-keyrings");
  fs.stat(keyring_dir, function(error, stats) {
    if (error) callback(error);
    if (stats.mode & 077 !== 0) {
      console.log("Warning: '" + keyring_dir + "' is accesible by other users");
      callback(null, {});
    }
    var keyring_file = path.join(keyring_dir, context);
    var file = fs.createReadStream(keyring_file);
    var keyring_data = "";
    file.on('data', function(data) { keyring_data += data.toString('ascii'); });
    file.on('error', function(error) { callback(error) });
    file.on('end', function() {
      var lines = keyring_data.split('\n');
      var keys = {};
      lines.forEach(function(l) { 
        var cookie = l.split(' ');
        if (cookie.length === 3) {
          keys[cookie[0]] = { ctime: cookie[1], secret: cookie[2] };
        }
      });
      callback(null, keys);
    });
  });
}

get_random_bytes = function(num_bytes, callback) {
  var rand = fs.createReadStream('/dev/urandom');
  var total_length = 0
  var result = new Buffer(num_bytes);
  rand.on('data', function(d) {
    var required_bytes = result.length - total_length;
    if (required_bytes > d.length) {
      required_bytes = d.length;
    }
    d.copy(result, total_length, 0, required_bytes);
    total_length += required_bytes;
    if (total_length === num_bytes) {
      rand.destroy();
      callback(null, result);
    }
  });
  rand.on('error', function(error) { callback(error) });
};
