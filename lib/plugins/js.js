
'use strict';

let co = require('co');
let debug = require('debug')('bundl:plugins:js');
let detective = require('detective');
let helpers = require('./helpers');
let path = require('path');
let resolve = require('resolve');
let verror = require('verror');


/**
 * Registers the plugin and it's config with the bundl instance.
 *
 * @param {Bundl} bundl  The builder instance.
 */
exports = module.exports = function (bundl) {
  // general config
  // bundl.extensions('js', [ '.js', '.json' ]);

  // js files
  bundl.preread('js', helpers.stat);
  bundl.read('js', helpers.read);
  bundl.dependencies('js', exports.dependencies);

  // json files
  bundl.preread('json', helpers.stat);
  bundl.read('json', helpers.read);
  bundl.postread('json', exports.json);
};

/**
 * Parses the file for dependencies.
 *
 * @param {File} file
 * @return {Promise}
 */
exports.dependencies = co.wrap(function* (file) {
  debug('%s: parsing dependencies', file.relative());
  let dir = path.dirname(file.path);

  let deps = detective(file.code);
  debug('%s: %d dependencies found %j', file.relative(), deps.length, deps);

  let resolved = yield deps.map(function (dep) {
    // TODO: handle core modules
    if (resolve.isCore(dep)) return Promise.resolve(false);

    return new Promise(function (approve, reject) {
      // TODO: handle extensions from other plugins (eg: "coffee", "ts", etc)
      resolve(dep, { basedir: dir }, function (err, result) {
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
    debug('%s: resolved %s to %s', file.relative(), dep, resolved[x]);
    acc[dep] = resolved[x];
    return acc;
  }, {});
});

/**
 * Makes a JSON file exportable to other CommonJS modules.
 *
 * @param {File} file
 * @return {Promise}
 */
exports.json = co.wrap(function* (file) {
  debug('%s exporting json as object', file.relative());

  try {
    // is this JSON valid? (will throw if not)
    // TODO: see if a nice module exists for this? (one with pretty errors)
    JSON.parse(file.code);
  } catch (err) {
    throw new verror.WError(err, `Invalid JSON in ${file.path}`);
  }

  file.code = `module.exports = ${file.code};`;
});
