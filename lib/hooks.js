
'use strict';

let debug = require('debug')('bundl:hooks');
let flatten = require('array-flatten');
let Ware = require('ware');


class Hooks {
  constructor() {
    debug('initialize');
    this.handlers = new Map();
  }

  set(action, type, handler) {
    let types = flatten([ type ]);
    let handlers = flatten([ handler ]);

    types.forEach(type => {
      handlers.forEach(handler => this.add(action, type, handler));
    });
  }

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

  run(action, type) {
    let args = [].slice.call(arguments, 2);
    let ware = this.handlers.get(`${action}-${type}`);

    if (!ware) {
      debug('%s:%s has no handlers', type, action);
      return Promise.resolve(args);
    }

    debug('%s:%s run with %d handlers', type, action, ware.fns.length);
    return new Promise(function (resolve, reject) {
      let a = args.concat(done);

      ware.run.apply(ware, a);

      function done(err) {
        if (err) {
          reject(err);
        } else {
          resolve.apply(null, args);
        }
      }
    });
  }
}


module.exports = Hooks;
