
'use strict';

let chai = require('chai');
let duo = require('..');
let Tree = require('../lib/tree');
let File = require('../lib/file');
let path = require('path');

chai.use(require('chai-as-promised'));
let assert = chai.assert;


describe('duo', function () {
  let fixture = path.resolve.bind(path, __dirname, 'fixtures');

  describe('.analyze(entry, [options])', function () {
    it('should return a Promise', function () {
      assert.instanceOf(duo.analyze(fixture('no-dependencies/index.js')), Promise);
    });

    it('should require the entry argument', function () {
      let result = duo.analyze();
      return assert.isRejected(result, /An entry file is required/);
    });

    context('with missing entry file', function () {
      it('should reject with a useful Error', function () {
        let result = duo.analyze(fixture('no-dependencies/does-not-exist'));
        return assert.isRejected(result, /Cannot find module 'test\/fixtures\/no-dependencies\/does-not-exist'/);
      });

      it('should adjust the message based on the root option', function () {
        let result = duo.analyze(fixture('no-dependencies/does-not-exist'), { root: fixture('no-dependencies') });
        return assert.isRejected(result, /Cannot find module 'does-not-exist'/);
      });
    });

    context('with an entry js file', function () {
      context('with a missing local dependency', function () {
        it('should reject with a useful Error', function () {
          let result = duo.analyze(fixture('missing-local-dependency/index.js'));
          return assert.isRejected(result, /Cannot find module/);
        });
      });

      context('with a missing remote dependency', function () {
        it('should reject with a useful Error', function () {
          let result = duo.analyze(fixture('missing-remote-dependency/index.js'));
          return assert.isRejected(result, /Cannot find module/);
        });
      });

      it('should give us a tree', function () {
        let result = duo.analyze(fixture('no-dependencies/index.js'));
        return assert.eventually.instanceOf(result, Tree);
      });

      context('with no dependencies', function () {
        it('should resolve successfully with a single node', function () {
          let result = duo.analyze(fixture('no-dependencies/index.js'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 1);
          });
        });

        it('should have our entry file in the tree', function () {
          let entry = fixture('no-dependencies/index.js');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            let file = tree.get(entry);
            assert.instanceOf(file, File);
            assert.strictEqual(file.path, entry);
            assert.isTrue(file.entry);
          });
        });
      });

      context('with 1 local dependency', function () {
        it('should have 2 nodes in the tree', function () {
          let result = duo.analyze(fixture('only-local-dependency/index.js'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 2);
          });
        });

        it('should have the dependency in the tree', function () {
          let entry = fixture('only-local-dependency/index.js');
          let dep = fixture('only-local-dependency/a.js');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [ dep, entry ]);
          });
        });
      });

      context('with multiple local dependencies', function () {
        it('should have 3 nodes in the tree', function () {
          let result = duo.analyze(fixture('only-local-dependencies/index.js'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 3);
          });
        });

        it('should have the dependencies in the tree', function () {
          let entry = fixture('only-local-dependencies/index.js');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-local-dependencies/a.js'),
              fixture('only-local-dependencies/b.js'),
              entry
            ]);
          });
        });
      });

      context('with nested local dependencies', function () {
        it('should have 4 nodes in the tree', function () {
          let result = duo.analyze(fixture('nested-local-dependencies/index.js'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 4);
          });
        });

        it('should have the dependencies in the tree', function () {
          let entry = fixture('nested-local-dependencies/index.js');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('nested-local-dependencies/c.js'),
              fixture('nested-local-dependencies/b.js'),
              fixture('nested-local-dependencies/a.js'),
              entry
            ]);
          });
        });
      });

      context('with 1 remote dependency', function () {
        it('should have 1 node in the tree', function () {
          let result = duo.analyze(fixture('only-remote-dependency/index.js'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 2);
          });
        });

        it('should have the dependency in the tree', function () {
          let entry = fixture('only-remote-dependency/index.js');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-remote-dependency/node_modules/a/index.js'),
              entry
            ]);
          });
        });
      });
    });

    context('with an entry css file', function () {
      context('with a missing local dependency', function () {
        it('should reject with a useful Error', function () {
          let result = duo.analyze(fixture('missing-local-dependency/index.css'));
          return assert.isRejected(result, /Cannot find module/);
        });
      });

      context('with a missing remote dependency', function () {
        it('should reject with a useful Error', function () {
          let result = duo.analyze(fixture('missing-remote-dependency/index.css'));
          return assert.isRejected(result, /Cannot find module/);
        });
      });

      it('should give us a tree', function () {
        let result = duo.analyze(fixture('no-dependencies/index.css'));
        return assert.eventually.instanceOf(result, Tree);
      });

      context('with no dependencies', function () {
        it('should resolve successfully with a single node', function () {
          let result = duo.analyze(fixture('no-dependencies/index.css'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 1);
          });
        });

        it('should have our entry file in the tree', function () {
          let entry = fixture('no-dependencies/index.css');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            let file = tree.get(entry);
            assert.instanceOf(file, File);
            assert.strictEqual(file.path, entry);
            assert.isTrue(file.entry);
          });
        });
      });

      context('with 1 local dependency', function () {
        it('should have 2 nodes in the tree', function () {
          let result = duo.analyze(fixture('only-local-dependency/index.css'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 2);
          });
        });

        it('should have the dependency in the tree', function () {
          let entry = fixture('only-local-dependency/index.css');
          let dep = fixture('only-local-dependency/a.css');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [ dep, entry ]);
          });
        });
      });

      context('with multiple local dependencies', function () {
        it('should have 3 nodes in the tree', function () {
          let result = duo.analyze(fixture('only-local-dependencies/index.css'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 3);
          });
        });

        it('should have the dependencies in the tree', function () {
          let entry = fixture('only-local-dependencies/index.css');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-local-dependencies/a.css'),
              fixture('only-local-dependencies/b.css'),
              entry
            ]);
          });
        });
      });

      context('with nested local dependencies', function () {
        it('should have 4 nodes in the tree', function () {
          let result = duo.analyze(fixture('nested-local-dependencies/index.css'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 4);
          });
        });

        it('should have the dependencies in the tree', function () {
          let entry = fixture('nested-local-dependencies/index.css');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('nested-local-dependencies/c.css'),
              fixture('nested-local-dependencies/b.css'),
              fixture('nested-local-dependencies/a.css'),
              entry
            ]);
          });
        });
      });

      context('with 1 remote dependency', function () {
        it('should have 1 node in the tree', function () {
          let result = duo.analyze(fixture('only-remote-dependency/index.css'));

          return result.then(function (tree) {
            assert.strictEqual(tree.count(), 2);
          });
        });

        it('should have the dependency in the tree', function () {
          let entry = fixture('only-remote-dependency/index.css');
          let result = duo.analyze(entry);

          return result.then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-remote-dependency/node_modules/a/index.css'),
              entry
            ]);
          });
        });
      });
    });

    context('with an entry folder', function () {

    });

    context('with an entry file using any other extension', function () {

    });
  });

  describe('.build()', function () {

  });
});
