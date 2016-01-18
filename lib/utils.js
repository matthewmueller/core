
'use strict';

let path = require('path');
let pretty = require('pretty-hrtime');

const pwd = process.cwd();


exports.relative = abs => path.relative(pwd, abs);

exports.timing = function (input) {
  let keys = Array.from(input.keys()).sort();
  let len = keys.reduce((acc, key) => Math.max(acc, key.length), 0);
  return keys.map(label => {
    return {
      label: label + ' '.repeat(len - label.length),
      value: pretty(input.get(label))
    };
  });
};
