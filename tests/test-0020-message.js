#!/usr/bin/env node

var dbus   = require('../lib/low_level')
  , assert = require('assert')
  ;

assert.throws(function() { dbus.createMethodCall() });
assert.throws(function() { dbus.createMethodCall('narf')});
assert.throws(function() { dbus.createMethodCall('narf', 'barf')});
assert.throws(function() { dbus.createMethodCall('narf', 'barf', 'snarf')});

var msg = dbus.createMethodCall('org.example.NodeDBusTest', '/', 'Method');

msg.marshal();
