
'use strict';

let co = require('co');
let flatten = require('array-flatten');

// TODO: move this to ./builder.js (unnecessary abstraction I think)

module.exports = co.wrap(function* (tree, builder) {
  let hooks = builder.hooks;

  let list = tree.getSources().map(function (entry) {
    return [ entry ].concat(tree.dependenciesOf(entry, true));
  });

  yield flatten(list).map(build);

  return tree;

  function build(path) {
    return co(function* () {
      let file = tree.getFile(path);
      yield hooks.run('prewrite', file.type, file, tree, builder);
      yield hooks.run('write', file.type, file, tree, builder);
      yield hooks.run('postwrite', file.type, file, tree, builder);
    });
  }
});
