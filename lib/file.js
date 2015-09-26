
'use strict';

let debug = require('debug')('bundl:file');
let extension = require('file-extension');
let path = require('path');


class File {
  constructor(root, location, entry) {
    this.root = root;
    this.path = path.resolve(root, location);
    this.entry = !!entry;
    this.type = extension(this.path);
    debug('initialize %s', this.relative());
  }

  relative() {
    return path.relative(this.root, this.path);
  }
}


// single export
module.exports = File;
