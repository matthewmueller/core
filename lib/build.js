
'use strict';

let co = require('co');
let debug = require('debug')('mako:build');
let relative = require('./utils').relative;


module.exports = co.wrap(function* (entries, tree, builder) {
  debug('building %j', entries.map(relative));
  let hooks = builder.hooks;
  let params = { topological: true, objects: true };

  // prune out any orphans before we start processing
  tree.prune(entries);

  // during prewrite, files must be processed sequentially to allow unrolling
  // the dependencies cleanly
  for (let file of tree.getFiles(params)) {
    yield hooks.run('postdependencies', file.type, file, tree, builder);
  }

  yield tree.getFiles(params).map(run('prewrite'));
  yield tree.getFiles(params).map(run('write'));
  yield tree.getFiles(params).map(run('postwrite'));

  return tree;

  /**
   * Helper function for running build hooks.
   *
   * @param {String} name  The hook to run.
   * @return {GeneratorFunction}
   */
  function run(name) {
    return function* (file) {
      yield hooks.run(name, file.type, file, tree, builder);
    };
  }
});
