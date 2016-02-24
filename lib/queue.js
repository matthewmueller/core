
'use strict';

let debug = require('debug')('mako:queue');

const defaults = {
  concurrency: Infinity,
  factory: null
};

class Queue {
  constructor(options) {
    debug('initialize %j', options);
    this.config = Object.assign({}, defaults, options);
    this.available = options.available || [];
    this.pending = new Set();
    this.done = new Set();
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    if (this.available.length) this.run();
  }

  add() {
    let args = [].slice.call(arguments);
    debug('add %j', args);
    this.available.push(args);
    this.run();
  }

  run() {
    debug('running');
    while (this.pending.size < this.config.concurrency) {
      if (!this.available.length) break;
      this.start(this.available.shift());
    }
  }

  start(args) {
    debug('start %j', args);
    let p = this.config.factory.apply(null, args);
    this.pending.add(p);
    p.then(() => this.finish(p, args), err => this.reject(err));
  }

  finish(p, args) {
    debug('finish %j', args);
    this.pending.delete(p);
    this.done.add(p);
    this.run();
    if (!this.available.length && !this.pending.size) this.resolve();
  }

  then() {
    return this.promise.then.apply(this.promise, arguments);
  }
}


module.exports = Queue;
