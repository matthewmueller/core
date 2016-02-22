
'use strict';

let co = require('co');
let debug = require('debug')('mako:assemble');
let relative = require('./utils').relative;


module.exports = co.wrap(function* (build) {
  debug('assembling %j', build.entries.map(relative));

  let timer = build.time('assemble');
  let tree = build.tree = build.tree.clone(); // replace the tree with a clone
  let runner = build.runner;
  let hooks = runner.hooks;
  let params = { topological: true, objects: true };

  // remove any circular dependencies, which allows topo sorting later
  tree.removeCycles();
  // prune out any orphans before we start processing, to avoid extra processing
  tree.prune(build.entries);

  // during prewrite, files must be processed sequentially to allow unrolling
  // the dependencies cleanly
  for (let file of tree.getFiles(params)) {
    yield hooks.run('postdependencies', file.type, file, tree, build);
  }

  // fetch the list of files again because it can change during postdependencies
  yield tree.getFiles(params).map(file => {
    runner.emit('before:assemble', file);
    return hooks.run('prewrite', file.type, file, tree, build);
  });

  // fetch the list of files again because it can change during prewrite
  yield tree.getFiles(params).map(function* (file) {
    yield hooks.run('write', file.type, file, tree, build);
    yield hooks.run('postwrite', file.type, file, tree, build);
    runner.emit('after:assemble', file);
  });

  timer();
  return build;
});
