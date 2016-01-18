
'use strict';

let path = require('path');
let pretty = require('pretty-hrtime');

let debug = require('debug')('mako:timing');
const pwd = process.cwd();


exports.relative = abs => path.relative(pwd, abs);

exports.timing = function (input) {
  let keys = Array.from(input.keys()).sort();
  let len = keys.reduce((acc, key) => Math.max(acc, key.length), 0);
  keys.forEach(key => {
    debug('%s %s', key + ' '.repeat(len - key.length), pretty(input.get(key)));
  });
};
