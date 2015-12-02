
'use strict';

let analyze = require('./analyze');
let build = require('./build');
let debug = require('debug')('mako:builder');
let flatten = require('array-flatten');
let Hooks = require('./hooks');
let Tree = require('mako-tree');


class Builder {
  constructor() {
    debug('initialize');
    this.hooks = new Hooks();
    this.tree = new Tree();
  }

  use() {
    let plugins = flatten.from(arguments);
    plugins.forEach(function (plugin) {
      debug('using plugin %s', plugin.name);
      plugin(this);
    }, this);
    return this;
  }

  preread(type, handler) {
    this.hooks.set('preread', type, handler);
    return this;
  }

  read(type, handler) {
    this.hooks.set('read', type, handler);
    return this;
  }

  postread(type, handler) {
    this.hooks.set('postread', type, handler);
    return this;
  }

  predependencies(type, handler) {
    this.hooks.set('predependencies', type, handler);
    return this;
  }

  dependencies(type, handler) {
    this.hooks.set('dependencies', type, handler);
    return this;
  }

  postdependencies(type, handler) {
    this.hooks.set('postdependencies', type, handler);
    return this;
  }

  prewrite(type, handler) {
    this.hooks.set('prewrite', type, handler);
    return this;
  }

  write(type, handler) {
    this.hooks.set('write', type, handler);
    return this;
  }

  postwrite(type, handler) {
    this.hooks.set('postwrite', type, handler);
    return this;
  }

  analyze() {
    let entries = flatten.from(arguments);
    if (!entries.length) {
      return Promise.reject(new Error('an entry file is required'));
    }

    debug('analyzing %j', entries);
    return analyze(entries, this);
  }

  build() {
    let entries = flatten.from(arguments);

    debug('building %j', entries);
    return this.analyze(entries).then(tree => build(entries, tree, this));
  }
}


module.exports = Builder;
