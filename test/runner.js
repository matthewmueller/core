
'use strict';

let Build = require('../lib/build');
let chai = require('chai');
let Runner = require('../lib/runner');
let Tree = require('mako-tree');
let path = require('path');

chai.use(require('chai-as-promised'));
let assert = chai.assert;
let fixture = path.resolve.bind(path, __dirname, 'fixtures');

describe('Runner([tree])', function () {
  it('should be a constructor function', function () {
    assert.instanceOf(new Runner(), Runner);
  });

  it('should allow setting a predefined tree', function () {
    let tree = new Tree();
    let runner = new Runner(tree);
    assert.strictEqual(runner.tree, tree);
  });

  // read hooks
  [ 'preread', 'read', 'postread', 'predependencies', 'dependencies' ].forEach(function (hook) {
    describe(`#${hook}(type, handler)`, function () {
      it('should be called upon by analyze', function () {
        let called = [];
        let mako = new Runner();

        mako[hook]('txt', function () {
          called.push(hook);
        });

        return mako.analyze(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should only be called on the file type specified', function () {
        let called = [];
        let mako = new Runner();

        mako[hook]('txt', function () {
          called.push(hook);
        });

        mako[hook]('js', function () {
          called.push(hook);
        });

        return mako.analyze(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should call the handlers in the order they were defined', function () {
        let called = [];
        let mako = new Runner();

        mako[hook]('txt', function () {
          called.push(`${hook}1`);
        });

        mako[hook]('txt', function () {
          called.push(`${hook}2`);
        });

        return mako.analyze(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ `${hook}1`, `${hook}2` ]);
        });
      });

      it('should allow async callback handlers', function () {
        let called = [];
        let mako = new Runner();

        mako[hook]('txt', function (file, tree, mako, done) {
          process.nextTick(function () {
            called.push(hook);
            done();
          });
        });

        return mako.analyze(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should allow async generator handlers', function () {
        let called = [];
        let mako = new Runner();

        mako[hook]('txt', function* () {
          yield new Promise(function (done) {
            process.nextTick(function () {
              called.push(hook);
              done();
            });
          });
        });

        return mako.analyze(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should allow async promise handlers', function () {
        let called = [];
        let mako = new Runner();

        mako[hook]('txt', function () {
          return new Promise(function (done) {
            process.nextTick(function () {
              called.push(hook);
              done();
            });
          });
        });

        return mako.analyze(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should run async handlers in order', function () {
        let called = [];
        let mako = new Runner();

        mako[hook]('txt', function (file, tree, mako, done) {
          setTimeout(function () {
            called.push(`${hook}1`);
            done();
          }, 25);
        });

        mako[hook]('txt', function (file, tree, mako, done) {
          process.nextTick(function () {
            called.push(`${hook}2`);
            done();
          });
        });

        return mako.analyze(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ `${hook}1`, `${hook}2` ]);
        });
      });

      it('should receive the entry file as an argument', function () {
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako[hook]('txt', function (file) {
          assert.equal(file.path, entry);
        });

        return mako.analyze(entry);
      });

      it('should receive the tree as an argument', function () {
        let mako = new Runner();

        mako[hook]('txt', function (file, tree) {
          assert.instanceOf(tree, Tree);
        });

        return mako.analyze(fixture('text/a.txt'));
      });

      it('should receive a build instance as an argument', function () {
        let mako = new Runner();

        mako[hook]('txt', function (file, tree, build) {
          assert.instanceOf(build, Build);
        });

        return mako.analyze(fixture('text/a.txt'));
      });

      it('should support multiple extensions', function () {
        let mako = new Runner();

        mako[hook]([ 'txt', 'md' ], function () {
          assert.isTrue(mako.hooks.has(hook, 'txt'));
        });

        return mako.analyze(fixture('text/a.txt'));
      });

      it('should not leave the analyzing flag on when an error is thrown (#7)', function () {
        let mako = new Runner();
        let entry = fixture('text/a.txt');
        let tree = mako.tree;

        mako[hook]('txt', function () {
          throw new Error('fail');
        });

        return mako.analyze(entry).catch(function () {
          assert.isFalse(tree.getFile(entry).analyzing);
        });
      });
    });
  });

  // assemble hooks
  [ 'postdependencies', 'prewrite', 'write', 'postwrite' ].forEach(function (hook) {
    describe(`#${hook}(type, handler)`, function () {
      it('should be called during assemble', function () {
        let called = [];
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function () {
          called.push(hook);
        });

        return mako.build(entry).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should only be called on the file type specified', function () {
        let called = [];
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function () {
          called.push(hook);
        });

        mako[hook]('js', function () {
          called.push(hook);
        });

        return mako.assemble(entry).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should call the handlers in the order they were defined', function () {
        let called = [];
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function () {
          called.push(`${hook}1`);
        });

        mako[hook]('txt', function () {
          called.push(`${hook}2`);
        });

        return mako.assemble(entry).then(function () {
          assert.deepEqual(called, [ `${hook}1`, `${hook}2` ]);
        });
      });

      it('should allow async callback handlers', function () {
        let called = [];
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function (file, tree, mako, done) {
          process.nextTick(function () {
            called.push(hook);
            done();
          });
        });

        return mako.assemble(entry).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should allow async generator handlers', function () {
        let called = [];
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function* () {
          yield new Promise(function (done) {
            process.nextTick(function () {
              called.push(hook);
              done();
            });
          });
        });

        return mako.assemble(entry).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should allow async promise handlers', function () {
        let called = [];
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function () {
          return new Promise(function (done) {
            process.nextTick(function () {
              called.push(hook);
              done();
            });
          });
        });

        return mako.assemble(entry).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should run async handlers in order', function () {
        let called = [];
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function (file, tree, mako, done) {
          setTimeout(function () {
            called.push(`${hook}1`);
            done();
          }, 25);
        });

        mako[hook]('txt', function (file, tree, mako, done) {
          process.nextTick(function () {
            called.push(`${hook}2`);
            done();
          });
        });

        return mako.assemble(entry).then(function () {
          assert.deepEqual(called, [ `${hook}1`, `${hook}2` ]);
        });
      });

      it('should receive the entry file as an argument', function () {
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function (file) {
          assert.equal(file.path, entry);
        });

        return mako.assemble(entry);
      });

      it('should receive the tree as an argument', function () {
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function (file, tree) {
          assert.instanceOf(tree, Tree);
        });

        return mako.assemble(entry);
      });

      it('should receive a build instance as an argument', function () {
        let mako = new Runner();
        let entry = fixture('text/a.txt');

        mako.tree.addFile(entry);

        mako[hook]('txt', function (file, tree, build) {
          assert.instanceOf(build, Build);
        });

        return mako.assemble(entry);
      });
    });
  });

  describe('#use(...plugins)', function () {
    it('should pass a function the builder instance', function () {
      let mako = new Runner();
      let called = false;
      mako.use(function (builder) {
        called = true;
        assert.strictEqual(builder, mako);
      });
      assert.isTrue(called);
    });

    it('should flatten the arguments into a single list', function () {
      let mako = new Runner();
      let called = [];

      mako.use(plugin1, [ plugin2, [ plugin3 ] ]);
      assert.deepEqual(called, [ 'plugin1', 'plugin2', 'plugin3' ]);

      function plugin1(builder) {
        called.push('plugin1');
        assert.strictEqual(builder, mako);
      }

      function plugin2(builder) {
        called.push('plugin2');
        assert.strictEqual(builder, mako);
      }

      function plugin3(builder) {
        called.push('plugin3');
        assert.strictEqual(builder, mako);
      }
    });

    it('should be chainable', function () {
      let mako = new Runner();
      assert.strictEqual(mako.use(plugin), mako);

      function plugin() {}
    });
  });

  describe('#analyze(...entries)', function () {
    it('should return a Promise', function () {
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      assert.instanceOf(mako.analyze(entry), Promise);
    });

    it('should require the entry argument', function () {
      let mako = new Runner();
      return assert.isRejected(mako.analyze(), /^Error: an entry file is required$/);
    });

    it('should resolve with a build instance', function () {
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      return assert.eventually.instanceOf(mako.analyze(entry), Build);
    });

    it('should call the read/dependency hooks in order', function () {
      let called = [];
      let mako = new Runner();

      mako.preread('txt', function () {
        called.push('preread');
      });

      mako.read('txt', function () {
        called.push('read');
      });

      mako.postread('txt', function () {
        called.push('postread');
      });

      mako.dependencies('txt', function () {
        called.push('dependencies');
      });

      return mako.analyze(fixture('text/a.txt')).then(function () {
        assert.deepEqual(called, [ 'preread', 'read', 'postread', 'dependencies' ]);
      });
    });

    it('should use the original type for the preread hook', function () {
      let called = [];
      let mako = new Runner();
      let entry = fixture('jade/index.jade');

      mako.preread('jade', function () {
        called.push('preread');
      });

      mako.postread('jade', function (file) {
        called.push('postread');
        file.type = 'html'; // mock transpile
      });

      mako.dependencies('html', function () {
        called.push('dependencies');
      });

      return mako.analyze(entry).then(function () {
        return mako.analyze(entry).then(function () {
          assert.deepEqual(called, [ 'preread', 'postread', 'dependencies', 'preread' ]);
        });
      });
    });

    it('should share the arguments between the read/dependency hooks', function () {
      let mako = new Runner();
      let args;

      mako.preread('txt', function (file, tree, builder) {
        args = [ file, tree, builder ];
      });

      mako.read('txt', function (file, tree, builder) {
        assert.strictEqual(file, args[0]);
        assert.strictEqual(tree, args[1]);
        assert.strictEqual(builder, args[2]);
      });

      mako.postread('txt', function (file, tree, builder) {
        assert.strictEqual(file, args[0]);
        assert.strictEqual(tree, args[1]);
        assert.strictEqual(builder, args[2]);
      });

      mako.dependencies('txt', function (file, tree, builder) {
        assert.strictEqual(file, args[0]);
        assert.strictEqual(tree, args[1]);
        assert.strictEqual(builder, args[2]);
      });

      return mako.analyze(fixture('text/a.txt'));
    });

    it('should recurse into any dependencies added during the dependencies hook', function () {
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      let dep = fixture('text/b.txt');
      let processed = [];

      mako.read('txt', function (file) {
        processed.push(file.path);
      });

      mako.dependencies('txt', function (file, tree) {
        if (file.path === entry) tree.addDependency(entry, dep);
      });

      return mako.analyze(entry).then(function () {
        assert.deepEqual(processed, [ entry, dep ]);
      });
    });

    it('should handle circular dependencies', function () {
      // circular: a -> b -> c -> b
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      let dep1 = fixture('text/b.txt');
      let dep2 = fixture('text/c.txt');
      let processed = [];

      mako.dependencies('txt', function (file, tree) {
        processed.push(file.path);
        if (file.path === entry) {
          tree.addDependency(entry, dep1);
        } else if (file.path === dep1) {
          tree.addDependency(dep1, dep2);
        } else if (file.path === dep2) {
          tree.addDependency(dep2, dep1);
        }
      });

      return mako.analyze(entry).then(function () {
        assert.deepEqual(processed, [ entry, dep1, dep2 ]);
      });
    });

    it('should re-analyze deep files marked as dirty', function () {
      let mako = new Runner();
      let a = fixture('text/a.txt');
      let b = fixture('text/b.txt');
      let c = fixture('text/c.txt');
      let processed = [];

      mako.read('txt', function (file) {
        processed.push(file.path);
      });

      mako.dependencies('txt', function (file) {
        if (file.path === a) {
          file.addDependency(b);
        } else if (file.path === b) {
          file.addDependency(c);
        }
      });

      return mako.analyze(a)
        .then(() => mako.tree.getFile(c).dirty())
        .then(() => mako.analyze(a))
        .then(() => assert.deepEqual(processed, [ a, b, c, c ]));
    });

    it('should always preread files during different builds', function () {
      let mako = new Runner();
      let a = fixture('text/a.txt');
      let b = fixture('text/b.txt');
      let c = fixture('text/c.txt');
      let processed = [];

      mako.preread('txt', function (file) {
        if (file.analyzed && file.path === c) file.dirty();
        processed.push(file.path);
      });

      mako.dependencies('txt', function (file) {
        if (file.path === a) {
          file.addDependency(b);
        } else if (file.path === b) {
          file.addDependency(c);
        }
      });

      return mako.analyze(a)
        .then(() => mako.analyze(a))
        .then(() => assert.deepEqual(processed, [ a, b, c, a, b, c ]));
    });

    describe('events', function () {
      [ 'analyze', 'preread', 'read', 'postread', 'predependencies', 'dependencies' ].forEach(function (type) {
        [ 'before', 'after' ].forEach(function (prefix) {
          const event = `${prefix}:${type}`;

          it(`should emit "${event}" for each file`, function () {
            let mako = new Runner();
            let a = fixture('text/a.txt');
            let b = fixture('text/b.txt');
            let c = fixture('text/c.txt');
            let processed = [];

            mako
              .preread('txt', noop)
              .read('txt', noop)
              .postread('txt', noop)
              .predependencies('txt', noop);

            mako.dependencies('txt', function (file) {
              if (file.path === a) {
                file.addDependency(b);
              } else if (file.path === b) {
                file.addDependency(c);
              }
            });

            return mako
              .on(event, file => processed.push(file.path))
              .analyze(a)
              .then(() => assert.deepEqual(processed, [ a, b, c ]));
          });
        });
      });

      function noop() {}
    });

    context('in parallel', function () {
      [ 'preread', 'read', 'postread', 'predependencies', 'dependencies' ].forEach(function (hook) {
        context(hook, function () {
          it(`should not call the ${hook} hook multiple times`, function () {
            let mako = new Runner();
            let entry = fixture('text/a.txt');
            let processed = [];

            mako[hook]('txt', function (file) {
              processed.push(file.path);
            });

            return Promise.all([
              mako.analyze(entry),
              mako.analyze(entry)
            ]).then(function () {
              assert.deepEqual(processed, [ entry ]);
            });
          });
        });
      });
    });

    context('in serial', function () {
      context('preread', function () {
        it('should always call the preread hook', function () {
          let mako = new Runner();
          let entry = fixture('text/a.txt');
          let processed = [];

          mako.preread('txt', function (file) {
            processed.push(file.path);
          });

          return mako.analyze(entry)
            .then(() => mako.analyze(entry))
            .then(() => assert.deepEqual(processed, [ entry, entry ]));
        });
      });

      [ 'read', 'postread', 'predependencies', 'dependencies' ].forEach(function (hook) {
        context(hook, function () {
          it(`should not call the ${hook} hook each time`, function () {
            let mako = new Runner();
            let entry = fixture('text/a.txt');
            let processed = [];

            mako[hook]('txt', function (file) {
              processed.push(file.path);
            });

            return mako.analyze(entry)
              .then(() => mako.analyze(entry))
              .then(() => assert.deepEqual(processed, [ entry ]));
          });

          it(`should call the ${hook} hook if the preread hook marks file as dirty`, function () {
            let mako = new Runner();
            let entry = fixture('text/a.txt');
            let processed = [];

            mako.preread('txt', function (file) {
              file.analyzed = false;
            });

            mako[hook]('txt', function (file) {
              processed.push(file.path);
            });

            return mako.analyze(entry)
              .then(() => mako.analyze(entry))
              .then(() => assert.deepEqual(processed, [ entry, entry ]));
          });
        });
      });
    });
  });

  describe('#assemble(...entries)', function () {
    it('should return a Promise', function () {
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      assert.instanceOf(mako.build(entry), Promise);
    });

    it('should require the entry argument', function () {
      let mako = new Runner();
      return assert.isRejected(mako.build(), /^Error: an entry file is required$/);
    });

    it('should resolve with a build instance', function () {
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      mako.tree.addFile(entry);
      return assert.eventually.instanceOf(mako.assemble(entry), Build);
    });
  });

  describe('#build(...entries)', function () {
    it('should return a Promise', function () {
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      assert.instanceOf(mako.build(entry), Promise);
    });

    it('should require the entry argument', function () {
      let mako = new Runner();
      return assert.isRejected(mako.build(), /^Error: an entry file is required$/);
    });

    it('should resolve with a build instance', function () {
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      return assert.eventually.instanceOf(mako.build(entry), Build);
    });

    it('should call postdependencies in sequential order (not in parallel)', function () {
      // a -> b -> c
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      let dep1 = fixture('text/b.txt');
      let dep2 = fixture('text/c.txt');
      let processed = [];

      mako.dependencies('txt', function (file) {
        if (file.path === entry) {
          file.addDependency(dep1);
        } else if (file.path === dep1) {
          file.addDependency(dep2);
        }
      });

      mako.postdependencies('txt', function (file, tree, builder, done) {
        // each one is staggered differently to test race conditions. if
        // these were kicked off in parallel (what we don't want) then
        // the order would be incorrect.
        if (file.path === entry) {
          setTimeout(finish, 1);
        } else if (file.path === dep1) {
          setTimeout(finish, 10);
        } else {
          setTimeout(finish, 25);
        }

        function finish() {
          processed.push(file.path);
          done();
        }
      });

      return mako.build(entry).then(function () {
        assert.deepEqual(processed, [ dep2, dep1, entry ]);
      });
    });

    it('should call the write hooks in order', function () {
      let called = [];
      let mako = new Runner();

      mako.prewrite('txt', function () {
        called.push('prewrite');
      });

      mako.write('txt', function () {
        called.push('write');
      });

      mako.postwrite('txt', function () {
        called.push('postwrite');
      });

      return mako.build(fixture('text/a.txt')).then(function () {
        assert.deepEqual(called, [ 'prewrite', 'write', 'postwrite' ]);
      });
    });

    it('should share the arguments between the write hooks', function () {
      let mako = new Runner();
      let args;

      mako.prewrite('txt', function (file, tree, builder) {
        args = [ file, tree, builder ];
      });

      mako.write('txt', function (file, tree, builder) {
        assert.strictEqual(file, args[0]);
        assert.strictEqual(tree, args[1]);
        assert.strictEqual(builder, args[2]);
      });

      mako.postwrite('txt', function (file, tree, builder) {
        assert.strictEqual(file, args[0]);
        assert.strictEqual(tree, args[1]);
        assert.strictEqual(builder, args[2]);
      });

      return mako.build(fixture('text/a.txt'));
    });

    it('should call hooks for all defined dependencies', function () {
      // a -> b -> c -> b* (circular)
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      let dep1 = fixture('text/b.txt');
      let dep2 = fixture('text/c.txt');
      let processed = [];

      mako.dependencies('txt', function (file) {
        processed.push(file.path);
        if (file.path === entry) {
          file.addDependency(dep1);
        } else if (file.path === dep1) {
          file.addDependency(dep2);
        } else if (file.path === dep2) {
          file.addDependency(dep1); // circular
        }
      });

      return mako.analyze(entry).then(function () {
        assert.deepEqual(processed, [ entry, dep1, dep2 ]);
      });
    });

    it('should call build hooks on dependencies first (bottom-up)', function () {
      // a -> b -> c
      let mako = new Runner();
      let entry = fixture('text/a.txt');
      let dep1 = fixture('text/b.txt');
      let dep2 = fixture('text/c.txt');
      let processed = [];

      mako.dependencies('txt', function (file) {
        if (file.path === entry) {
          file.addDependency(dep1);
        } else if (file.path === dep1) {
          file.addDependency(dep2);
        }
      });

      mako.write('txt', function (file) {
        processed.push(file.path);
      });

      return mako.build(entry).then(function () {
        assert.deepEqual(processed, [ dep2, dep1, entry ]);
      });
    });

    describe('events', function () {
      [ 'postdependencies', 'assemble', 'prewrite', 'write', 'postwrite' ].forEach(function (type) {
        [ 'before', 'after' ].forEach(function (prefix) {
          const event = `${prefix}:${type}`;

          it(`should emit "${event}" for each file`, function () {
            let mako = new Runner();
            let a = fixture('text/a.txt');
            let b = fixture('text/b.txt');
            let c = fixture('text/c.txt');
            let processed = [];

            mako.dependencies('txt', function (file) {
              if (file.path === a) {
                file.addDependency(b);
              } else if (file.path === b) {
                file.addDependency(c);
              }
            });

            mako
              .postdependencies('txt', noop)
              .prewrite('txt', noop)
              .write('txt', noop)
              .postwrite('txt', noop);

            return mako
              .on(event, file => processed.push(file.path))
              .build(a)
              .then(() => assert.deepEqual(processed, [ c, b, a ]));
          });
        });
      });

      function noop() {}
    });
  });
});
