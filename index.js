
'use strict';

let Builder = require('./lib/builder');


exports = module.exports = function () {
  return new Builder();
};

exports.Builder = Builder;
