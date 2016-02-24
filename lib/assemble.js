
'use strict';

let co = require('co');
let debug = require('debug')('mako:assemble');
let Queue = require('./queue');
let relative = require('./utils').relative;


module.exports = co.wrap(function* (build) {
  debug('assembling %j', build.entries.map(relative));

  let timer = build.time('assemble');
  let tree = build.tree = build.tree.clone(); // replace the tree with a clone
  let runner = build.runner;
  let hooks = runner.hooks;
  let config = runner.config;
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

  // during prewrite, new files can be added to the tree (eg: adding a ".gz"
  // version of any file, adding a ".min.js" for each ".js", etc)
  // keep iterating until the size of the tree matches the number processed
  let prewritten = new Set();
  while (prewritten.size !== tree.size()) {
    yield tree.getFiles(params)
      .filter(file => !prewritten.has(file))
      .map(file => {
        prewritten.add(file);
        runner.emit('before:assemble', file);
        return hooks.run('prewrite', file.type, file, tree, build);
      });
  }

  // fetch the list of files again because it can change during prewrite
  let writes = new Queue({
    available: tree.getFiles(params).map(file => [ file ]),
    concurrency: config.concurrency,
    factory: co.wrap(function* (file) {
      yield hooks.run('write', file.type, file, tree, build);
      yield hooks.run('postwrite', file.type, file, tree, build);
      runner.emit('after:assemble', file);
    })
  });

  yield writes.promise;

  timer();
  return build;
});
