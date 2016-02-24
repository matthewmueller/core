
'use strict';

let co = require('co');
let debug = require('debug')('mako:analyze');
let Queue = require('./queue');
let relative = require('./utils').relative;


module.exports = function (build) {
  debug('analyzing %j', build.entries.map(relative));

  let entries = build.entries;
  let runner = build.runner;
  let hooks = runner.hooks;
  let tree = runner.tree;
  let config = runner.config;
  let analyzed = new Set(); // keeps track of files analyzed during this cycle

  let queue = new Queue({
    concurrency: config.concurrency,
    factory: co.wrap(analyze)
  });

  entries.forEach(entry => queue.add(entry, true));

  // if any files deep in the hierarchy were marked dirty after the previous
  // build, they would not be reached by this recursive processing, so we find
  // those in the list and analyze them directly (recursively)
  // tree.getFiles({ objects: true })
  //   .filter(file => !file.analyzed)
  //   .forEach(file => queue(file.path));

  return queue.then(() => build, err => Promise.reject(err));

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
    let done = build.time('analyze');

    try {
      file.analyzing = true;
      // preread is always run, as it has the opportunity to mark a file as
      // "dirty" so it will be analyzed. (such as when an mtime changes)
      // preread also always uses the original file type in case later
      // plugins change the type, allowing entries to be transpiled and
      // still picked up correctly.
      yield hooks.run('preread', file.initialType(), file, tree, build);
      if (!file.analyzed) {
        debug('analyzing %s', relative(file.path));
        runner.emit('before:analyze', file);

        yield hooks.run('read', file.type, file, tree, build);
        yield hooks.run('postread', file.type, file, tree, build);
        yield hooks.run('predependencies', file.type, file, tree, build);
        yield hooks.run('dependencies', file.type, file, tree, build);
        // the postdependencies hook runs at the outset of the build phase

        debug('analyzed %s', relative(path));
        file.analyzed = true;
        analyzed.add(file.path);
        runner.emit('after:analyze', file);
      }
      file.analyzing = false;
      done('analyze');
    } catch (err) {
      file.analyzing = false;
      file.dirty();
      done('analyze');
      throw err;
    }

    file.dependencies().forEach(dep => queue.add(dep));
  }
};
