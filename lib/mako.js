
'use strict';

let analyze = require('./analyze');
let build = require('./build');
let debug = require('debug')('mako:builder');
let Emitter = require('events');
let flatten = require('array-flatten');
let Hooks = require('./hooks');
let Tree = require('mako-tree');


/**
 * The core class for the mako builder. This is the public API developers will
 * use when using the JS API directly.
 *
 * @class
 */
class Builder extends Emitter {
  /**
   * Builds a new instance.
   */
  constructor() {
    debug('initialize');
    super();
    this.hooks = new Hooks();
    this.tree = new Tree();
  }

  /**
   * Add plugins to the builder. All arguments will be flattened into a single
   * array of plugin functions.
   *
   * @return {Builder}  This method is chainable.
   */
  use() {
    let plugins = flatten.from(arguments);
    plugins.forEach(function (plugin) {
      debug('using plugin %s', plugin.name);
      plugin(this);
    }, this);
    return this;
  }

  /**
   * Adds a preread hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  preread(type, handler) {
    this.hooks.set('preread', type, handler);
    return this;
  }

  /**
   * Adds a read hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  read(type, handler) {
    this.hooks.set('read', type, handler);
    return this;
  }

  /**
   * Adds a postread hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  postread(type, handler) {
    this.hooks.set('postread', type, handler);
    return this;
  }

  /**
   * Adds a predependencies hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  predependencies(type, handler) {
    this.hooks.set('predependencies', type, handler);
    return this;
  }

  /**
   * Adds a dependencies hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  dependencies(type, handler) {
    this.hooks.set('dependencies', type, handler);
    return this;
  }

  /**
   * Adds a postdependencies hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  postdependencies(type, handler) {
    this.hooks.set('postdependencies', type, handler);
    return this;
  }

  /**
   * Adds a prewrite hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  prewrite(type, handler) {
    this.hooks.set('prewrite', type, handler);
    return this;
  }

  /**
   * Adds a write hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  write(type, handler) {
    this.hooks.set('write', type, handler);
    return this;
  }

  /**
   * Adds a postwrite hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Builder}          This method is chainable.
   */
  postwrite(type, handler) {
    this.hooks.set('postwrite', type, handler);
    return this;
  }

  /**
   * Runs analysis on the given arguments as entry files.
   *
   * @return {Promise}
   */
  analyze() {
    let entries = flatten.from(arguments);
    if (!entries.length) {
      return Promise.reject(new Error('an entry file is required'));
    }

    return analyze(entries, this);
  }

  /**
   * Runs a analysis + build on the given arguments as entry files.
   *
   * @return {Promise}
   */
  build() {
    let entries = flatten.from(arguments);
    return this.analyze(entries).then(tree => build(entries, tree, this));
  }
}


// single export
module.exports = Builder;
