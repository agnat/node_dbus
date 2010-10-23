
var illeagl_chars = /[^A-Za-z0-9_]+/;

exports.object_path = function(p) {
  var e = function(reason) {
    return new Error("invalid object path" + (reason ? ": " + reason : ""));
  }
  if (!p) throw e("path is falsy");
  if (p[0] !== '/') throw e("path does not start with a slash");

  if (p.length === 1) {
    return;
  }
  p.split('/').forEach(function(el) {
    if (!el) throw e("path contains empty elements")
    if (el.match(illeagl_chars)) throw e("path contains illegal characters");
  });
}

exports.interface_name = function(i) {
  var e = function(reason) {
    return new Error("invalid interface name" + (reason ? ": " + reason : ""));
  }

  if (!i) throw e("interface name is falsy");
  if (i.length > 255) throw e("length exceeds 255 characters");

  var elements = i.split('.');
  elements.forEach(function(el) {
    if (!el) throw e("contains empty elements");
    if (el.match(illeagl_chars)) throw e("contains illegal characters");
    if (("0123456789").indexOf(el[0]) !== -1) throw e("elements may not start with a digit");
  });
  if (elements.length < 2) throw e("must have at least two elements");
  
}
exports.bus_name = function(b) {
  
}
exports.member_name = function(m) {}
