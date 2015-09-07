
'use strict';

let Graph = require('dependency-graph').DepGraph;
let File = require('./file');


class Tree {
  constructor(config) {
    this.config = config;
    this.graph = new Graph();
    this.map = new Map();
  }

  file(path, entry) {
    let file = new File(path, this.config, !!entry);
    this.map.set(path, file);
    this.graph.addNode(path);
    return file;
  }

  dependency(parent, child) {
    this.graph.addDependency(parent, child);
  }

  get(path) {
    return this.map.get(path);
  }

  count() {
    return this.map.size;
  }
}


// single export
module.exports = Tree;
