
'use strict';

let Builder = require('./builder');


exports = module.exports = function () {
  return new Builder();
};

exports.Builder = Builder;
