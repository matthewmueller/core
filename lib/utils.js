
'use strict';

let path = require('path');
let pretty = require('pretty-hrtime');

let debug = require('debug')('mako:timing');
const pwd = process.cwd();

exports.relative = abs => path.relative(pwd, abs);

exports.timing = function (input) {
  let list = Array.from(input.entries()).sort(sorter);

  let len = list.reduce((acc, entry) => Math.max(acc, entry[0].length), 0);
  list.forEach(entry => {
    let key = entry[0];
    let time = pretty(entry[1]);
    debug('%s %s', key + ' '.repeat(len - key.length), time);
  });
};

function sorter(a, b) {
  if (a[1][0] !== b[1][0]) return a[1][0] < b[1][0] ? 1 : -1;
  return a[1][1] < b[1][1] ? 1 : -1;
}
