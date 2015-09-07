
'use strict';

let defaults = require('defaults');
let path = require('path');
let Tree = require('./tree');


module.exports = function (entry, options) {
  if (!entry) return Promise.reject(new Error('An entry file is required'));

  let config = defaults(options, {
    root: process.cwd(),
    transform: []
  });

  let tree = new Tree(config);
  return analyze(path.resolve(config.root, entry), true);

  function analyze(path, isEntry) {
    let file = tree.file(path, isEntry);

    return file.analyze().then(function (dependencies) {
      let recurse = dependencies.map(function (dep) {
        tree.file(dep);
        tree.dependency(path, dep);
        return analyze(dep);
      });

      return Promise.all(recurse).then(function () {
        return tree;
      });
    });
  }
};
