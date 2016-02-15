
'use strict';

let Runner = require('./lib/runner');

module.exports = function (tree) {
  return new Runner(tree);
};
