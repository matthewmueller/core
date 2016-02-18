
'use strict';

let path = require('path');
let pretty = require('pretty-hrtime');

let debug = require('debug')('mako:timing');
const pwd = process.cwd();

exports.relative = abs => path.relative(pwd, abs);

exports.timing = function (input) {
  let list = Array.from(input.entries()).sort((a, b) => sort(a[1], b[1]));

  let len = list.reduce((acc, entry) => Math.max(acc, entry[0].length), 0);
  list.forEach(entry => {
    let key = entry[0];
    let time = pretty(entry[1]);
    debug('%s %s', key + ' '.repeat(len - key.length), time);
  });
};

function sort(a, b) {
  // convert hrtime into a single number
  let a1 = a[0] * 1e9 + a[1];
  let b1 = b[0] * 1e9 + b[1];
  return b1 - a1; // sorts ascending
}
