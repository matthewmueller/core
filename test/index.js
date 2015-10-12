
'use strict';

let assert = require('chai').assert;
let Builder = require('../lib/builder');
let mako = require('..');

describe('mako', function () {
  it('should export a function', function () {
    assert.isFunction(mako);
  });

  it('should return a builder instance', function () {
    assert.instanceOf(mako(), Builder);
  });
});
