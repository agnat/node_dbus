
var unescape_regex = /%[a-fA-F0-9]{2}/;
function dbus_unescape(v) {
  return v.replace(unescape_regex, function(m) {
    console.log(m);
  });
}

exports.ServerAddress = function(str) {
  var self = this;
  var s = str.split(':');
  self.transport = s[0];

  var kv = s[1].split(',');
  self.attributes = {}
  for (var i = 0; i < kv.length; ++i) {
    s = kv[i].split('=');
    self.attributes[s[0]] = dbus_unescape(s[1]);
  }
}
