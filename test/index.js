
'use strict';

let chai = require('chai');
let Bundl = require('..');
let Tree = require('../lib/tree');
let File = require('../lib/file');
let path = require('path');

chai.use(require('chai-as-promised'));
let assert = chai.assert;
let fixture = path.resolve.bind(path, __dirname, 'fixtures');

describe('Bundl', function () {
  it('should be a function', function () {
    assert.instanceOf(Bundl, Function);
  });

  it('should be a constructor function', function () {
    assert.instanceOf(new Bundl(), Bundl);
  });

  it('should set the root as pwd', function () {
    let bundl = new Bundl();
    assert.strictEqual(bundl.config.root, process.cwd());
  });

  it('should merge additional config', function () {
    let conf = { a: 'A' };
    let bundl = new Bundl(conf);
    assert.strictEqual(bundl.config.a, conf.a);
  });

  it('should set a new root', function () {
    let conf = { root: 'test' };
    let bundl = new Bundl(conf);
    assert.strictEqual(bundl.config.root, conf.root);
  });

  describe('#extensions(type, [list])', function () {
    context('without a list argument', function () {
      it('should return an array of extensions', function () {
        let bundl = new Bundl();
        assert.deepEqual(bundl.extensions('js'), [ '.js', '.json' ]);
        assert.deepEqual(bundl.extensions('css'), [ '.css' ]);
      });
    });

    context('with a list argument', function () {
      it('should add to the set of extensions', function () {
        let bundl = new Bundl();
        bundl.extensions('js', [ '.coffee' ]);
        assert.deepEqual(bundl.extensions('js'), [ '.js', '.json', '.coffee' ]);
        bundl.extensions('css', [ '.gif', '.jpg', '.jpeg', '.png' ]);
        assert.deepEqual(bundl.extensions('css'), [ '.css', '.gif', '.jpg', '.jpeg', '.png' ]);
      });
    });
  });

  describe('#analyze(entry, [options])', function () {
    it('should return a Promise', function () {
      let bundl = new Bundl({ root: fixture('no-dependencies') });
      assert.instanceOf(bundl.analyze('index.js'), Promise);
    });

    it('should require the entry argument', function () {
      let bundl = new Bundl({ root: fixture('no-dependencies') });
      return assert.isRejected(bundl.analyze(), /^Error: An entry file is required$/);
    });

    context('with missing entry file', function () {
      let bundl = new Bundl({ root: fixture('no-dependencies') });

      it('should reject with a useful Error', function () {
        let result = bundl.analyze('does-not-exist.js');
        return assert.isRejected(result, /^Cannot find module 'does-not-exist\.js'$/);
      });
    });

    context('with an entry js file', function () {
      it('should give us a tree', function () {
        let bundl = new Bundl({ root: fixture('no-dependencies') });
        return assert.eventually.instanceOf(bundl.analyze('index.js'), Tree);
      });

      context('with a missing local dependency', function () {
        let bundl = new Bundl({ root: fixture('missing-local-dependency') });

        it('should reject with a useful Error', function () {
          return assert.isRejected(bundl.analyze('index.js'), /^Error: Cannot find module '.\/a'/);
        });
      });

      context('with a missing remote dependency', function () {
        let bundl = new Bundl({ root: fixture('missing-remote-dependency') });

        it('should reject with a useful Error', function () {
          return assert.isRejected(bundl.analyze('index.js'), /^Error: Cannot find module 'a'/);
        });
      });

      context('with no dependencies', function () {
        let bundl = new Bundl({ root: fixture('no-dependencies') });

        it('should resolve successfully with a single node', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.strictEqual(tree.count(), 1);
          });
        });

        it('should have our entry file in the tree', function () {
          let entry = fixture('no-dependencies/index.js');
          return bundl.analyze('index.js').then(function (tree) {
            let file = tree.get(entry);
            assert.instanceOf(file, File);
            assert.strictEqual(file.path, entry);
            assert.isTrue(file.entry);
          });
        });
      });

      context('with 1 local dependency', function () {
        let bundl = new Bundl({ root: fixture('only-local-dependency') });

        it('should have 2 nodes in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.strictEqual(tree.count(), 2);
          });
        });

        it('should have the dependency in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-local-dependency/a.js'),
              fixture('only-local-dependency/index.js')
            ]);
          });
        });
      });

      context('with multiple local dependencies', function () {
        let bundl = new Bundl({ root: fixture('only-local-dependencies') });

        it('should have 3 nodes in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.strictEqual(tree.count(), 3);
          });
        });

        it('should have the dependencies in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-local-dependencies/a.js'),
              fixture('only-local-dependencies/b.js'),
              fixture('only-local-dependencies/index.js')
            ]);
          });
        });
      });

      context('with nested local dependencies', function () {
        let bundl = new Bundl({ root: fixture('nested-local-dependencies') });

        it('should have 4 nodes in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.strictEqual(tree.count(), 4);
          });
        });

        it('should have the dependencies in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('nested-local-dependencies/c.js'),
              fixture('nested-local-dependencies/b.js'),
              fixture('nested-local-dependencies/a.js'),
              fixture('nested-local-dependencies/index.js')
            ]);
          });
        });
      });

      context('with 1 remote dependency', function () {
        let bundl = new Bundl({ root: fixture('only-remote-dependency') });

        it('should have 1 node in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.strictEqual(tree.count(), 2);
          });
        });

        it('should have the dependency in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-remote-dependency/node_modules/a/index.js'),
              fixture('only-remote-dependency/index.js')
            ]);
          });
        });
      });

      context.only('with an unknown dependency type', function () {
        let bundl = new Bundl({ root: fixture('unknown-dependency-type') });

        it('should throw a useful error', function () {
          return assert.isRejected(bundl.analyze('index.js'), /^Error: Unknown file type$/);
        });
      });

      context('with a json dependency', function () {
        let bundl = new Bundl({ root: fixture('json-dependency') });

        it('should include the file in the tree', function () {
          return bundl.analyze('index.js').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('json-dependency/a.json'),
              fixture('json-dependency/index.js')
            ]);
          });
        });
      });
    });

    context('with an entry css file', function () {
      it('should give us a tree', function () {
        let bundl = new Bundl({ root: fixture('no-dependencies') });
        return assert.eventually.instanceOf(bundl.analyze('index.css'), Tree);
      });

      context('with a missing local dependency', function () {
        let bundl = new Bundl({ root: fixture('missing-local-dependency') });

        it('should reject with a useful Error', function () {
          return assert.isRejected(bundl.analyze('index.css'), /^Error: Cannot find module '.\/a'/);
        });
      });

      context('with a missing remote dependency', function () {
        let bundl = new Bundl({ root: fixture('missing-remote-dependency') });

        it('should reject with a useful Error', function () {
          return assert.isRejected(bundl.analyze('index.css'), /^Error: Cannot find module 'a'/);
        });
      });

      context('with no dependencies', function () {
        let bundl = new Bundl({ root: fixture('no-dependencies') });

        it('should resolve successfully with a single node', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.strictEqual(tree.count(), 1);
          });
        });

        it('should have our entry file in the tree', function () {
          let entry = fixture('no-dependencies/index.css');

          return bundl.analyze('index.css').then(function (tree) {
            let file = tree.get(entry);
            assert.instanceOf(file, File);
            assert.strictEqual(file.path, entry);
            assert.isTrue(file.entry);
          });
        });
      });

      context('with 1 local dependency', function () {
        let bundl = new Bundl({ root: fixture('only-local-dependency') });

        it('should have 2 nodes in the tree', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.strictEqual(tree.count(), 2);
          });
        });

        it('should have the dependency in the tree', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-local-dependency/a.css'),
              fixture('only-local-dependency/index.css')
            ]);
          });
        });
      });

      context('with multiple local dependencies', function () {
        let bundl = new Bundl({ root: fixture('only-local-dependencies') });

        it('should have 3 nodes in the tree', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.strictEqual(tree.count(), 3);
          });
        });

        it('should have the dependencies in the tree', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-local-dependencies/a.css'),
              fixture('only-local-dependencies/b.css'),
              fixture('only-local-dependencies/index.css')
            ]);
          });
        });
      });

      context('with nested local dependencies', function () {
        let bundl = new Bundl({ root: fixture('nested-local-dependencies') });

        it('should have 4 nodes in the tree', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.strictEqual(tree.count(), 4);
          });
        });

        it('should have the dependencies in the tree', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('nested-local-dependencies/c.css'),
              fixture('nested-local-dependencies/b.css'),
              fixture('nested-local-dependencies/a.css'),
              fixture('nested-local-dependencies/index.css')
            ]);
          });
        });
      });

      context('with 1 remote dependency', function () {
        let bundl = new Bundl({ root: fixture('only-remote-dependency') });

        it('should have 1 node in the tree', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.strictEqual(tree.count(), 2);
          });
        });

        it('should have the dependency in the tree', function () {
          return bundl.analyze('index.css').then(function (tree) {
            assert.deepEqual(tree.graph.overallOrder(), [
              fixture('only-remote-dependency/node_modules/a/index.css'),
              fixture('only-remote-dependency/index.css')
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

  describe('#build()', function () {

  });
});
