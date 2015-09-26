
'use strict';

let co = require('co');
let debug = require('debug')('bundl:plugins:css');
let helpers = require('./helpers');
let parseImport = require('parse-import');
let path = require('path');
let resolve = require('resolve');


/**
 * Core plugin for handling CSS files.
 *
 * @param {Builder} bundl  The bundl builder instance.
 */
exports = module.exports = function (bundl) {
  debug('adding to builder %s', bundl.config.root);

  // js files
  bundl.preread('css', helpers.stat);
  bundl.read('css', helpers.read);
  bundl.dependencies('css', exports.dependencies);
};

/**
 * Handle parsing and resolving dependencies for CSS files.
 *
 * @param {File} file
 * @return {Promise}
 */
exports.dependencies = co.wrap(function* (file) {
  debug('parsing dependencies for %s', file.relative());
  let dir = path.dirname(file.path);
  let deps = parseImport(file.code);
  debug('%d dependencies found', deps.length);

  let resolved = yield deps.map(function (dep) {
    return new Promise(function (approve, reject) {
      // TODO: handle extensions from other plugins (eg: "less", "sass", etc)
      let options = { basedir: dir, extensions: [ '.css' ] };

      resolve(dep.path, options, function (err, result) {
        if (err) {
          reject(err);
        } else {
          approve(result);
        }
      });
    });
  });

  // transform into an object: relative => absolute
  file.dependencies = deps.reduce(function (acc, dep, x) {
    debug('resolved %s to %s', dep.path, resolved[x]);
    acc[dep.path] = resolved[x];
    return acc;
  }, {});
});
