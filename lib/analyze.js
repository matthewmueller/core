
'use strict';

let co = require('co');
let debug = require('debug')('mako:analyze');
let relative = require('./utils').relative;


module.exports = co.wrap(function* (entries, builder) {
  debug('analyze %d files', entries.length);

  let hooks = builder.hooks;
  let tree = builder.tree;
  let analyzed = new Set(); // keeps track of files analyzed during this cycle

  yield entries.map(entry => co(analyze(entry, true)));

  // if any files deep in the hierarchy were marked dirty after the previous
  // build, they would not be reached by this recursive processing, so we find
  // those in the list and analyze them directly (recursively)
  yield tree.getFiles({ objects: true })
    .filter(file => !file.analyzed)
    .map(file => analyze(file.path));

  return tree.clone();

  /**
   * Helper for running analysis on a file.
   *
   * @param {String} path      The absolute path to the file.
   * @param {Boolean} [entry]  Whether this file is an entry.
   */
  function* analyze(path, entry) {
    debug('start %s', relative(path));
    let file = tree.addFile(path, !!entry);
    if (file.analyzing || analyzed.has(path)) return;
    builder.emit('analyze', file);

    try {
      file.analyzing = true;
      // preread is always run, as it has the opportunity to mark a file as
      // "dirty" so it will be analyzed. (such as when an mtime changes)
      // preread also always uses the original file type in case later
      // plugins change the type, allowing entries to be transpiled and
      // still picked up correctly.
      yield hooks.run('preread', file.initialType(), file, tree, builder);
      if (!file.analyzed) {
        debug('analyzing %s', relative(file.path));

        yield hooks.run('read', file.type, file, tree, builder);
        yield hooks.run('postread', file.type, file, tree, builder);
        yield hooks.run('predependencies', file.type, file, tree, builder);
        yield hooks.run('dependencies', file.type, file, tree, builder);
        // the postdependencies hook runs at the outset of the build phase

        file.analyzed = true;
        analyzed.add(file.path);
        debug('analyzed %s', relative(path));
      }
      file.analyzing = false;
    } catch (err) {
      file.analyzing = false;
      file.dirty();
      throw err;
    }

    yield file.dependencies().map(dep => analyze(dep));

    if (entry) debug('analyzed dependencies for %s', relative(path));
    builder.emit('analyzed', file);
  }
});
