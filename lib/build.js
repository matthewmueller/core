
'use strict';

/**
 * Used to follow an entire build from start to finish, particularly for stats
 * and reporting.
 *
 * @class
 */
class Build {
  /**
   * Creates a new instance.
   *
   * @param {Runner} runner  The spawning Runner instance
   * @param {Array} entries  The entry files to process for this build
   * @param {Tree} tree      The tree to use for this build
   */
  constructor(runner, entries, tree) {
    this.runner = runner;
    this.entries = entries;
    this.tree = tree;

    this.start = process.hrtime();
    this.timing = new Map();
  }

  /**
   * Allow for timing groups of things in a build. Rather than tracking
   * individual things only, each label is expected to be called multiple times,
   * likely for each file in the build. (they will be added together throughout
   * the build)
   *
   * The function returned can simply be called to conclude the timer
   *
   * @param {String} label  The label for this group.
   * @return {Function}
   */
  time(label) {
    let start = process.hrtime();
    let called = false;
    return () => {
      if (called) return; // only allow one call (add a warning here?)
      let existing = this.timing.get(label);
      this.timing.set(label, add(existing, process.hrtime(start)));
      called = true;
    };
  }
}

module.exports = Build;


/**
 * Adds 2 hi-res times together.
 *
 * @param {Array} a  The previous timing value.
 * @param {Array} b  The timing value to add.
 * @return {Array}
 */
function add(a, b) {
  if (!a) return b.slice();
  return [ a[0] + b[0], a[1] + b[1] ];
}
