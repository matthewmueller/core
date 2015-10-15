
'use strict';

let assert = require('chai').assert;
let Tree = require('../lib/tree');

describe('Tree()', function () {
  it('should be a constructor function', function () {
    assert.instanceOf(new Tree(), Tree);
  });

  it('should be empty by default', function () {
    let tree = new Tree();
    assert.equal(tree.size(), 0);
  });

  describe('#addNode(key, [data])', function () {
    it('should add a new vertex', function () {
      let tree = new Tree();
      tree.addNode('a');

      assert.isTrue(tree.hasNode('a'));
    });

    it('should not create duplicates if the node already exists', function () {
      let tree = new Tree();
      tree.addNode('a');
      tree.addNode('a');

      assert.isTrue(tree.hasNode('a'));
    });

    context('with data', function () {
      it('should store than value with the node', function () {
        let tree = new Tree();
        tree.addNode('a', 'A');
        assert.strictEqual(tree.getNode('a'), 'A');
      });
    });
  });

  describe('#hasNode(key)', function () {
    let tree = new Tree();
    tree.addNode('a');

    it('should return false for a missing node', function () {
      assert.isFalse(tree.hasNode('z'));
    });

    it('should return true for an existing node', function () {
      assert.isTrue(tree.hasNode('a'));
    });
  });

  describe('#getSources()', function () {
    it('should return an empty list', function () {
      let tree = new Tree();
      assert.deepEqual(tree.getSources(), []);
    });

    it('should return only the top-level entry', function () {
      // a -> b -> c
      //   -> d
      let tree = new Tree();
      tree.addNode('a');
      tree.addNode('b');
      tree.addNode('c');
      tree.addNode('d');
      tree.addDependency('a', 'b');
      tree.addDependency('b', 'c');
      tree.addDependency('a', 'd');

      assert.deepEqual(tree.getSources(), [ 'a' ]);
    });

    it('should return all the top-level entries', function () {
      // a -> b
      // c -> d -> e
      let tree = new Tree();
      tree.addNode('a');
      tree.addNode('b');
      tree.addNode('c');
      tree.addNode('d');
      tree.addNode('e');
      tree.addDependency('a', 'b');
      tree.addDependency('c', 'd');
      tree.addDependency('d', 'e');

      assert.deepEqual(tree.getSources(), [ 'a', 'c' ]);
    });
  });

  describe('#addDependency(parent, child, [data])', function () {
    it('should create an edge between the parent and child', function () {
      let tree = new Tree();
      tree.addNode('a');
      tree.addNode('b');
      tree.addDependency('a', 'b');

      assert.isTrue(tree.hasDependency('a', 'b'));
    });

    it('should automatically create any missing vertices', function () {
      let tree = new Tree();
      tree.addDependency('a', 'b');

      assert.isTrue(tree.hasNode('a'));
      assert.isTrue(tree.hasNode('b'));
    });

    context('with data', function () {
      it('should store the value with the edge', function () {
        let tree = new Tree();
        tree.addDependency('a', 'b', 'AB');

        assert.strictEqual(tree.getDependency('a', 'b'), 'AB');
      });
    });
  });

  describe('#hasDependency(parent, child)', function () {
    let tree = new Tree();
    tree.addDependency('a', 'b');

    it('should return false for a missing dependency', function () {
      assert.isFalse(tree.hasDependency('a', 'z'));
    });

    it('should return true for an existing dependency', function () {
      assert.isTrue(tree.hasDependency('a', 'b'));
    });
  });

  describe('#dependenciesOf(node, [recursive])', function () {
    // a > b > c > d
    let tree = new Tree();
    tree.addNode('a');
    tree.addNode('b');
    tree.addNode('c');
    tree.addNode('d');
    tree.addDependency('a', 'b');
    tree.addDependency('b', 'c');
    tree.addDependency('c', 'd');

    it('should return the direct dependencies of node', function () {
      assert.deepEqual(tree.dependenciesOf('a'), [ 'b' ]);
    });

    context('with recursive', function () {
      it('should all the dependencies of node', function () {
        assert.deepEqual(tree.dependenciesOf('a', true), [ 'b', 'c', 'd' ]);
      });
    });
  });

  describe('#dependantsOf(node, [recursive])', function () {
    // a > b > c > d
    let tree = new Tree();
    tree.addNode('a');
    tree.addNode('b');
    tree.addNode('c');
    tree.addNode('d');
    tree.addDependency('a', 'b');
    tree.addDependency('b', 'c');
    tree.addDependency('c', 'd');

    it('should return the direct dependencies of node', function () {
      assert.deepEqual(tree.dependantsOf('d'), [ 'c' ]);
    });

    context('with recursive', function () {
      it('should all the dependencies of node', function () {
        assert.deepEqual(tree.dependantsOf('d', true), [ 'c', 'b', 'a' ]);
      });
    });
  });
});
