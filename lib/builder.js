
'use strict';

let analyze = require('./analyze');
let core = require('./plugins');
let debug = require('debug')('bundl:builder');
let defaults = require('defaults');
let extension = require('file-extension');
let flatten = require('array-flatten');
let Hooks = require('./hooks');


class Builder {
  constructor(config) {
    debug('initialize');

    this.config = defaults(config, {
      root: process.cwd(),
      plugins: [ core ]
    });

    debug('config', this.config);

    this.types = new Set();
    this.hooks = new Hooks();
    this.ext = new Map();
    this.config.plugins.forEach(plugin => plugin(this));
  }

  type(ext) {
    if (!ext) throw new Error('a file type is required');
    if (typeof ext !== 'string') throw new TypeError('type must be a string');
    this.types.add(ext);
  }

  extensions(type, list) {
    this.type(type);
    if (!this.ext.has(type)) this.ext.set(type, []);
    let ext = this.ext.get(type);
    ext.push.apply(ext, list);
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
      let err = new Error('An entry file is required');
      return Promise.reject(err);
    }

    for (let x = 0; x < entries.length; x += 1) {
      let entry = entries[x];
      let ext = extension(entry);

      if (!this.types.has(ext)) {
        let err = new Error(`Unsupported file type '${ext}' for '${entry}'`);
        return Promise.reject(err);
      }
    }

    debug('analyzing %j', entries);
    return analyze(entries, this.config, this.hooks);
  }
}


module.exports = Builder;
