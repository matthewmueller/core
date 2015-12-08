
'use strict';

let co = require('co');


module.exports = co.wrap(function* (entries, tree, builder) {
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

  function run(name) {
    return function* (file) {
      yield builder.hooks.run(name, file.type, file, tree, builder);
    };
  }
});
