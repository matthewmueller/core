
'use strict';

let analyze = require('./analyze');
let build = require('./build');
let debug = require('debug')('mako:builder');
let flatten = require('array-flatten');
let Hooks = require('./hooks');


class Builder {
  constructor() {
    debug('initialize');
    this.hooks = new Hooks();
    this.ext = new Map();
  }

  use() {
    let plugins = flatten(arguments);
    plugins.forEach(function (plugin) {
      debug('using plugin %s', plugin.name);
      plugin(this);
    }, this);
    return this;
  }

  extensions(category, list) {
    if (!category) throw new Error('a category name is required');
    if (!this.ext.has(category)) this.ext.set(category, new Set());
    let set = this.ext.get(category);
    if (list) flatten(list).forEach(ext => set.add(ext));
    return Array.from(set);
  }

  preread(type, handler) {
    this.hooks.set('preread', type, handler);
  }

  read(type, handler) {
    this.hooks.set('read', type, handler);
  }

  postread(type, handler) {
    this.hooks.set('postread', type, handler);
  }

  predependencies(type, handler) {
    this.hooks.set('predependencies', type, handler);
  }

  dependencies(type, handler) {
    this.hooks.set('dependencies', type, handler);
  }

  postdependencies(type, handler) {
    this.hooks.set('postdependencies', type, handler);
  }

  prewrite(type, handler) {
    this.hooks.set('prewrite', type, handler);
  }

  write(type, handler) {
    this.hooks.set('write', type, handler);
  }

  postwrite(type, handler) {
    this.hooks.set('postwrite', type, handler);
  }

  analyze() {
    let entries = flatten(arguments);
    if (!entries.length) {
      return Promise.reject(new Error('an entry file is required'));
    }

    debug('analyzing %j', entries);
    return analyze(entries, this);
  }

  build() {
    let entries = flatten(arguments);

    debug('building %j', entries);
    return this.analyze(entries).then(tree => build(entries, tree, this));
  }
}


module.exports = Builder;
