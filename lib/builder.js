
'use strict';

let analyze = require('./analyze');
let build = require('./build');
let debug = require('debug')('bundl:builder');
let extension = require('file-extension');
let flatten = require('array-flatten');
let Hooks = require('./hooks');


class Builder {
  constructor() {
    debug('initialize');

    this.hooks = new Hooks();
    this.types = new Set();
    this.ext = new Map();
  }

  use() {
    let plugins = flatten(arguments);
    plugins.forEach(function (plugin) {
      debug('using plugin %s', plugin.name);
      plugin(this);
    }, this);
  }

  type(ext) {
    if (!ext) throw new Error('a file type is required');
    if (typeof ext !== 'string') throw new TypeError('type must be a string');
    this.types.add(ext);
  }

  extensions(type, list) {
    this.type(type);
    if (!this.ext.has(type)) this.ext.set(type, new Set());
    let set = this.ext.get(type);
    if (!list) return Array.from(set);
    flatten(list).forEach(ext => set.add(ext));
  }

  preread(type, handler) {
    this.type(type);
    this.hooks.set('preread', type, handler);
  }

  read(type, handler) {
    this.type(type);
    this.hooks.set('read', type, handler);
  }

  postread(type, handler) {
    this.type(type);
    this.hooks.set('postread', type, handler);
  }

  dependencies(type, handler) {
    this.type(type);
    this.hooks.set('dependencies', type, handler);
  }

  prewrite(type, handler) {
    this.type(type);
    this.hooks.set('prewrite', type, handler);
  }

  write(type, handler) {
    this.type(type);
    this.hooks.set('write', type, handler);
  }

  postwrite(type, handler) {
    this.type(type);
    this.hooks.set('postwrite', type, handler);
  }

  analyze() {
    let entries = flatten(arguments);
    if (!entries.length) {
      let err = new Error('an entry file is required');
      return Promise.reject(err);
    }

    for (let x = 0; x < entries.length; x += 1) {
      let entry = entries[x];
      let ext = extension(entry);

      if (!this.types.has(ext)) {
        let err = new Error(`unsupported file type '${ext}' for '${entry}'`);
        return Promise.reject(err);
      }
    }

    debug('analyzing %j', entries);
    return analyze(entries, this);
  }

  build() {
    let entries = flatten(arguments);
    debug('building %j', entries);

    return this.analyze(entries).then(tree => build(tree, this));
  }
}


module.exports = Builder;
