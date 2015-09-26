
'use strict';

let js = require('./js');
let css = require('./css');


module.exports = function (bundl) {
  js(bundl);
  css(bundl);
};
