
'use strict';

let detective = require('detective');
let parseImport = require('parse-import');

module.exports = function (ext, body) {
  switch (ext) {
  case '.js': return js(body);
  case '.css': return css(body);
  default: return [];
  }
};

function js(body) {
  return detective(body);
}

function css(body) {
  return parseImport(body).map(function (i) {
    return i.path;
  });
}
