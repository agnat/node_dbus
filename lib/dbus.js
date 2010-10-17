var childproc = require('child_process');

var Connection = exports.Connection = require('./connection').Connection;


exports.address = function(adr) {
  return function(callback) {
    callback(null, adr);
  }
}

exports.SESSION_BUS = function(callback) {
  if (process.env['DBUS_SESSION_BUS_ADDRESS']) {
    callback(undefined, process.env['DBUS_SESSION_BUS_ADDRESS']);
  } else {
    var launchctl = childproc.spawn('launchctl',
        ['getenv', 'DBUS_LAUNCHD_SESSION_BUS_SOCKET']);
    var socket_path = "";
    launchctl.stdout.on('data', function(data) { socket_path += data.toString('utf8'); });
    launchctl.on('error', function(error) { callback(error) });
    launchctl.on('exit', function(code) { callback(undefined, 'unix:path=' + socket_path) });
  }
}

