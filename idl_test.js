#!/usr/bin/env node
var idl = require('./lib/idl.js');

idl.interface('org.example.FluxCompensator', {
    compensate:     idl.method()
  , maxFluxReached: idl.signal()
});
