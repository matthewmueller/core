
'use strict';

let denodeify = require('denodeify');
let deps = require('./deps');
let fs = require('fs');
let path = require('path');
let readFile = denodeify(fs.readFile);
let resolve = denodeify(require('resolve'));
let verror = require('verror');


class File {
  constructor(path, config, entry) {
    this.path = path;
    this.config = config;
    this.entry = !!entry;
    this.id = this.relative(path);
  }

  relative() {
    return path.relative(this.config.root, this.path);
  }

  read() {
    let id = this.id;
    if (this.body) return Promise.resolve(this.body);

    return readFile(this.path, 'utf8').catch(function (err) {
      let error = new verror.WError(err, `Cannot find module '${id}'`);
      return Promise.reject(error);
    });
  }

  analyze() {
    let ext = path.extname(this.path);
    let dir = path.dirname(this.path);

    return this.read().then(function (body) {
      let dependencies = deps(ext, body);

      return Promise.all(dependencies.map(function (dep) {
        return resolve(dep, {
          basedir: dir,
          extensions: [ ext ]
        });
      }));
    });
  }
}


// single export
module.exports = File;
