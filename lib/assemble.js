
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

  // prune out any orphans before we start processing
  tree.prune(build.entries);

  // during prewrite, files must be processed sequentially to allow unrolling
  // the dependencies cleanly
  for (let file of tree.getFiles(params)) {
    yield hooks.run('postdependencies', file.type, file, tree, build);
  }

  // fetch the list of files again because it can change during the
  // postdependencies hook (but won't be modified during write as of now)
  for (let file of tree.getFiles(params)) {
    runner.emit('before:build', file);
    yield hooks.run('prewrite', file.type, file, tree, build);
    yield hooks.run('write', file.type, file, tree, build);
    yield hooks.run('postwrite', file.type, file, tree, build);
    runner.emit('after:build', file);
  }

  timer();
  return build;
});
