
'use strict';

let debug = require('debug')('bundl:file');
let extension = require('file-extension');


class File {
  constructor(location) {
    this.path = location;
    this.type = extension(this.path);
    debug('initialize %s', this.path);
  }
}


// single export
module.exports = File;
