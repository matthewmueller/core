
'use strict';

let co = require('co');
let Tree = require('mako-tree');

// TODO: move this to ./builder.js (unnecessary abstraction I think)

module.exports = co.wrap(function* (entries, builder) {
  let hooks = builder.hooks;
  let tree = new Tree();

  yield entries.map(analyze);

  return tree;

  function analyze(path) {
    return co(function* () {
      let file = tree.addFile(path);
      file.analyzing = true;

      yield hooks.run('preread', file.type, file, tree, builder);
      yield hooks.run('read', file.type, file, tree, builder);
      yield hooks.run('postread', file.type, file, tree, builder);

      yield hooks.run('predependencies', file.type, file, tree, builder);
      yield hooks.run('dependencies', file.type, file, tree, builder);
      // the postdependencies hook runs at the outset of the build phase

      file.analyzing = false;
      file.analyzed = true;

      let deps = tree.dependenciesOf(file.path).filter(function (path) {
        let file = tree.getFile(path);
        return !(file.analyzing || file.analyzed);
      });

      yield deps.map(analyze);
    });
  }
});
