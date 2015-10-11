
'use strict';

let debug = require('debug')('bundl:tree');
let Graph = require('graph.js/dist/graph.full.js');


class Tree {
  constructor() {
    debug('initialize');
    this.graph = new Graph();
  }

  addNode(key, data) {
    debug('adding node: %s', key);
    this.graph.addVertex(key, data);
  }

  hasNode(key) {
    return this.graph.hasVertex(key);
  }

  getNode(key) {
    return this.graph.vertexValue(key);
  }

  getSources() {
    return Array.from(this.graph.sources()).map(function (vertex) {
      return vertex[0];
    });
  }

  addDependency(parent, child, data) {
    debug('adding dependency %s > %s', parent, child);
    this.graph.createEdge(parent, child, data);
  }

  hasDependency(parent, child) {
    return this.graph.hasEdge(parent, child);
  }

  dependenciesOf(node, recursive) {
    let deps = recursive
      ? this.graph.verticesWithPathFrom(node)
      : this.graph.verticesFrom(node);

    return Array.from(deps).map(function (vertex) {
      return vertex[0];
    });
  }

  dependantsOf(node, recursive) {
    let deps = recursive
      ? this.graph.verticesWithPathTo(node)
      : this.graph.verticesTo(node);

    return Array.from(deps).map(function (vertex) {
      return vertex[0];
    });
  }

  toObject() {
    let nodes = [];
    for (let vertex of this.graph.vertices()) {
      nodes.push(transformNode.apply(null, vertex));
    }

    let edges = [];
    for (let edge of this.graph.edges()) {
      edges.push(transformEdge.apply(null, edge));
    }

    return {
      graph: {
        directed: true,
        type: 'dependency',
        nodes: nodes,
        edges: edges
      }
    };
  }
}


// single export
module.exports = Tree;


// private helpers

function transformNode(key, data) {
  let node = { id: key };
  if (!data) return node;

  return Object.keys(data).reduce(function (acc, key) {
    if (key === 'label' || key === 'type') {
      acc[key] = data[key];
    } else {
      if (!acc.metadata) acc.metadata = {};
      acc.metadata[key] = data[key];
    }
    return acc;
  }, node);
}

function transformEdge(source, target, data) {
  let edge = {
    source: source,
    target: target,
    relation: 'dependency',
    directed: true
  };

  if (data) edge.metadata = data; // TODO: clone

  return edge;
}
