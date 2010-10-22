
var _unescape_regex = /%[A-Fa-f0-9]{2}/;
function _unescape(str) {
  return str.replace(_unescape_regex, function(m) {
    return String.fromCharCode(parseInt(m.substr(1), 16));
  });
};

var _escape_regex = /[^-0-9A-Za-z_\/.\\]/;
function _escape(str) {
  return str.replace(_escape_regex, function(m) {
    var hex_str = m.charCodeAt(0).toString(16);
    if (hex_str.length === 1) {
      hex_str = "0" + hex_str;
    }
    return "%" + hex_str;
  });
};

function Address(transport, attributes) {
  this.transport = transport;
  this.attributes = attributes;
}
Address.prototype.toString = function() {
  var result = this.transport + ":";
  for (var a in this.attributes) {
    result += a + "=" + _escape_regex(this.attributes[a]);
  }
  return result;
}

Address.parse = function(address_string) {
  var a = address_string.split(':');
  var transport = a[0];
  var attributes = {};
  a = a[1].split(',');
  for (var i = 0; i < a.length; ++i) {
    var kv = a[i].split('=');
    attributes[kv[0]] = _unescape(kv[1]);
  }
  return new Address(transport, attributes);
}

exports.Address = Address;
