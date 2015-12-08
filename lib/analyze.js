
'use strict';

let co = require('co');
let debug = require('debug')('mako:analyze');


module.exports = co.wrap(function* (entries, builder) {
  debug('analyze %d files', entries.length);
  let hooks = builder.hooks;
  let tree = builder.tree;

  yield entries.map(entry => analyze(entry, true));

  return tree.clone();

  function analyze(path, entry) {
    return co(function* () {
      debug('start %s', path);
      let file = tree.addFile(path, !!entry);
      if (file.analyzing) return;

      try {
        file.analyzing = true;
        // preread is always run, as it has the opportunity to mark a file as
        // "dirty" so it will be analyzed. (such as when an mtime changes)
        // preread also always uses the original file type in case later plugins
        // change the type, allowing entries to be transpiled and still picked
        // up correctly.
        yield hooks.run('preread', file.initialType(), file, tree, builder);
        if (!file.analyzed) {
          debug('analyzing %s', file.path);
          yield hooks.run('read', file.type, file, tree, builder);
          yield hooks.run('postread', file.type, file, tree, builder);
          yield hooks.run('predependencies', file.type, file, tree, builder);
          yield hooks.run('dependencies', file.type, file, tree, builder);
          // the postdependencies hook runs at the outset of the build phase
          file.analyzed = true;
          debug('analyzed %s', file.path);
        }
        file.analyzing = false;
      } catch (err) {
        file.analyzing = false;
        file.dirty();
        throw err;
      }

      let deps = file.dependencies({ objects: true })
        .filter(file => !(file.analyzing || file.analyzed));

      debug('dependencies of %s: %j', file.path, deps);
      yield deps.map(dep => analyze(dep.path));
    });
  }
});
