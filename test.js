#!/usr/bin/env node

var dbus = require('./lib/dbus');

var sessionBus = new dbus.Connection();
sessionBus.open(dbus.SESSION_BUS, function(error, address) {
  if (error) {
    console.log(error);
  } else {
    console.log(address);
  }
});
