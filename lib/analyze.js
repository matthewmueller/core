
'use strict';

let co = require('co');
let path = require('path');
let Tree = require('./tree');
let values = require('object-values');


module.exports = co.wrap(function* (entries, builder) {
  let config = builder.config;
  let hooks = builder.hooks;
  let tree = new Tree(config);

  yield entries.map(function (entry) {
    return analyze(tree.file(path.resolve(config.root, entry), true));
  });

  return tree;

  function analyze(file) {
    return read(file).then(recurse);

    function read(file) {
      return co(function* () {
        yield hooks.run('preread', file.type, file, builder);
        yield hooks.run('read', file.type, file, builder);
        yield hooks.run('postread', file.type, file, builder);
        yield hooks.run('dependencies', file.type, file, builder);
        return file;
      });
    }

    function recurse(file) {
      if (!file.dependencies) return null;

      let deps = values(file.dependencies).map(function (dep) {
        if (dep) {
          let dependency = tree.file(dep);
          tree.dependency(file.path, dep);
          if (dependency) return analyze(dependency);
        }
      });

      return Promise.all(deps);
    }
  }
});
