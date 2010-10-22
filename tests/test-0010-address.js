#!/usr/bin/env node

var assert = require('assert')
  , util   = require('util')
  ;

var Address = require('../lib/address').Address;

var a = Address.parse('unix:path=/some/path');
assert.strictEqual(a.transport, 'unix');
assert.strictEqual(a.attributes.path, '/some/path');

a = Address.parse('unix:path=escaped_equal%3d');
assert.strictEqual(a.transport, 'unix');
assert.strictEqual(a.attributes.path, 'escaped_equal=');
