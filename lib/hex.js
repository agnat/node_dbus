var Buffer = require('buffer').Buffer;

var ascii_nibble = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f'];

var binary_nibble = { '0': 0 , '1': 1 , '2': 2 , '3': 3 , '4': 4 , '5': 5 ,
  '6': 6 , '7': 7 , '8': 8 , '9': 9 , 'a': 10 , 'b': 11 , 'c': 12 , 'd': 13,
  'e': 14 , 'f': 15 };

exports.encode = function hexencode(str) {
  var result = "";
  for (var i = 0; i < str.length; ++i) {
    var c = str.charCodeAt(i);
    result += ascii_nibble[c >> 4];
    result += ascii_nibble[c & 0x0f];
  }
  return result;
}

exports.encodeBuffer = function (buf) {
  var result = "";
  for (var i = 0; i < buf.length; ++i) {
    result += ascii_nibble[buf[i] >> 4];
    result += ascii_nibble[buf[i] & 0x0f];
  }
  return result;
}

exports.decode = function hexdecode(str) {
  var result = new Buffer(str.length / 2);
  var i = 0;
  while (i < str.length) {
    result[i>>1] = (binary_nibble[str[i++]] << 4) + binary_nibble[str[i++]];
  }
  return result;
}

exports.isHex = function(str) {
  for (var i = 0; i < str.length; ++i) {
    if (! (str[i] in binary_nibble)) return false;
  }
  return true;
}
