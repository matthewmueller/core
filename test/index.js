
'use strict';

let assert = require('chai').assert;
let Builder = require('../lib/mako');
let mako = require('..');

describe('mako', function () {
  it('should export a function', function () {
    assert.isFunction(mako);
  });

  it('should return a builder instance', function () {
    assert.instanceOf(mako(), Builder);
  });
});
