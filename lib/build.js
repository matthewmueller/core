
'use strict';

let co = require('co');
let debug = require('debug')('mako:build');
let relative = require('./utils').relative;


module.exports = co.wrap(function* (entries, tree, builder) {
  debug('building %j', entries.map(relative));
  let hooks = builder.hooks;
  let params = { topological: true, objects: true };

  // prune out any orphans before we start processing
  tree.prune(entries);

  // during prewrite, files must be processed sequentially to allow unrolling
  // the dependencies cleanly
  for (let file of tree.getFiles(params)) {
    if (file.entry) builder.emit('build', file);
    yield hooks.run('postdependencies', file.type, file, tree, builder);
  }

  // fetch the list of files again because it can change during the
  // postdependencies hook (but won't be modified during write as of now)
  for (let file of tree.getFiles(params)) {
    builder.emit('write', file);
    yield hooks.run('prewrite', file.type, file, tree, builder);
    yield hooks.run('write', file.type, file, tree, builder);
    yield hooks.run('postwrite', file.type, file, tree, builder);
    builder.emit('written', file);
  }

  return tree;
});
