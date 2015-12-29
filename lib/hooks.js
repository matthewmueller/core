
'use strict';

let debug = require('debug')('mako:hooks');
let flatten = require('array-flatten');
let Ware = require('ware');


/**
 * A helper class for managing and running hooks.
 *
 * @class
 */
class Hooks {
  /**
   * Creates a new instance.
   */
  constructor() {
    debug('initialize');
    this.handlers = new Map();
  }

  /**
   * Checks to see if the given action/type combination has been registered.
   *
   * @param {String} action  The hook name.
   * @param {String} type    The file type.
   * @return {Boolean}
   */
  has(action, type) {
    return this.handlers.has(`${action}-${type}`);
  }

  /**
   * The "public" interface for adding handlers. It will flatten lists of
   * types and handlers and add them all.
   *
   * @see {Hooks#add()}
   * @param {String} action     The hook name.
   * @param {String} type       The file type(s).
   * @param {Function} handler  The handler fn(s).
   */
  set(action, type, handler) {
    let types = flatten([ type ]);
    let handlers = flatten([ handler ]);

    types.forEach(type => {
      handlers.forEach(handler => this.add(action, type, handler));
    });
  }

  /**
   * Adds a single `handler` for the given `action` and `type`.
   *
   * @param {String} action     The hook name.
   * @param {String} type       The file type(s).
   * @param {Function} handler  The handler fn.
   */
  add(action, type, handler) {
    let name = handler.name || '(unnamed)';
    let key = `${action}-${type}`;
    debug('%s:%s add %s', type, action, name);

    if (this.handlers.has(key)) {
      this.handlers.get(key).use(handler);
    } else {
      this.handlers.set(key, new Ware(handler));
    }
  }

  /**
   * Runs the handlers for the given `action` and `type`.
   *
   * @param {String} action  The hook name.
   * @param {String} type    The file type(s).
   * @param {File} file      The current file.
   * @param {Tree} tree      The current tree.
   * @param {Mako} builder   The mako builder instance.
   * @return {Promise}
   */
  run(action, type, file, tree, builder) {
    let key = `${action}-${type}`;
    if (!this.handlers.has(key)) return Promise.resolve();

    let ware = this.handlers.get(key);
    debug('%s:%s run with %d handlers', type, action, ware.fns.length);
    return new Promise(function (resolve, reject) {
      builder.emit(`before:${action}`, file);
      ware.run(file, tree, builder, function (err) {
        if (err) {
          reject(err);
        } else {
          builder.emit(`after:${action}`, file);
          resolve();
        }
      });
    });
  }
}


// single export
module.exports = Hooks;
