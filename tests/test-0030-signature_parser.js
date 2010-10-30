#!/usr/bin/env node

var sig_parser = require('../lib/signature_parser')
  , sig        = require('../lib/signature')
  , assert     = require('assert')
  , util       = require('util')
  ;

var s = sig_parser.parse('yyyyuu');
s.forEach(function(arg) { assert.ok( arg instanceof sig.Basic) });

s = sig_parser.parse('yyyyuuai');
var size = 0;
s.forEach(function(arg) { size += arg.paddedSize(size, arg) });
console.log("size: " + size);

s = sig_parser.parse('a{ss}');
assert.ok( s[0] instanceof sig.Array_ );
assert.ok( s[0].element_type instanceof sig.DictEntry );
assert.ok( s[0].element_type.key_type instanceof sig.Basic );
assert.ok( s[0].element_type.value_type instanceof sig.Basic );

sig_parser.parse('');
sig_parser.parse('(yy(u))(ii)');
sig_parser.parse('a(is)');




