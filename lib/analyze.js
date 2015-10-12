
'use strict';

let co = require('co');
let File = require('./file');
let Tree = require('./tree');

// TODO: move this to ./builder.js (unnecessary abstraction I think)

module.exports = co.wrap(function* (entries, builder) {
  let hooks = builder.hooks;
  let tree = new Tree();

  yield entries.map(analyze);

  return tree;

  function analyze(path) {
    return co(function* () {
      let file = new File(path);
      tree.addNode(path, file);

      yield hooks.run('preread', file.type, file, tree, builder);
      yield hooks.run('read', file.type, file, tree, builder);
      yield hooks.run('postread', file.type, file, tree, builder);
      yield hooks.run('dependencies', file.type, file, tree, builder);

      yield tree.dependenciesOf(file.path).filter(function (file) {
        return !tree.getNode(file);
      }).map(analyze);
    });
  }
});
