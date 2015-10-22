
'use strict';

let co = require('co');

// TODO: move this to ./builder.js (unnecessary abstraction I think)

module.exports = co.wrap(function* (entries, tree, builder) {
  let hooks = builder.hooks;

  // during prewrite, files must be processed sequentially to allow unrolling
  // the dependencies cleanly
  for (let file of getFiles(tree)) {
    yield hooks.run('postdependencies', file.type, file, tree, builder);
  }

  yield getFiles(tree).map(run('prewrite'));
  yield getFiles(tree).map(run('write'));
  yield getFiles(tree).map(run('postwrite'));

  return tree;

  function run(name) {
    return function* (file) {
      yield builder.hooks.run(name, file.type, file, tree, builder);
    };
  }
});

function getFiles(tree) {
  return tree.topologicalOrder().map(function (file) {
    return tree.getFile(file);
  });
}
