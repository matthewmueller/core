
'use strict';

let co = require('co');
let fs = require('promised-io/fs');
let verror = require('verror');


/**
 * Stats the file, this can be seen as an existence check at this state. At
 * later stages, we'll be able to use the `mtime` for cache-related checks.
 *
 * @param {File} file
 * @returns {Promise}
 */
exports.stat = co.wrap(function* (file) {
  try {
    file.stat = yield fs.stat(file.path);
  } catch (err) {
    throw new verror.WError(err, 'Cannot find module \'%s\'', file.relative());
  }
});

/**
 * Reads the file, setting the initial `Buffer` as `raw` and then setting the
 * `String` as `code`.
 *
 * @param {File} file
 * @returns {Promise}
 */
exports.read = co.wrap(function* (file) {
  file.raw = yield fs.readFile(file.path);
  file.code = file.raw.toString();
});

// TODO: exports.readBuffer? Some plugins might want only a buffer, such as
// image optimization and similar.
