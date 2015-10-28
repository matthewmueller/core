
'use strict';

let chai = require('chai');
let Builder = require('../lib/builder');
let Tree = require('mako-tree');
let path = require('path');

chai.use(require('chai-as-promised'));
let assert = chai.assert;
let fixture = path.resolve.bind(path, __dirname, 'fixtures');

describe('Builder()', function () {
  it('should be a constructor function', function () {
    assert.instanceOf(new Builder(), Builder);
  });

  // read hooks
  [ 'preread', 'read', 'postread', 'predependencies', 'dependencies' ].forEach(function (hook) {
    describe(`#${hook}(type, handler)`, function () {
      it('should be called upon by analyze', function () {
        let called = [];
        let mako = new Builder();

        mako[hook]('txt', function () {
          called.push(hook);
        });

        return mako.analyze(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should only be called on the file type specified', function () {
        let called = [];
        let mako = new Builder();

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
        let mako = new Builder();

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
        let mako = new Builder();

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
        let mako = new Builder();

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
        let mako = new Builder();

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
        let mako = new Builder();

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
        let mako = new Builder();
        let entry = fixture('text/a.txt');

        mako[hook]('txt', function (file) {
          assert.equal(file.path, entry);
        });

        return mako.analyze(entry);
      });

      it('should receive the tree as an argument', function () {
        let mako = new Builder();

        mako[hook]('txt', function (file, tree) {
          assert.instanceOf(tree, Tree);
        });

        return mako.analyze(fixture('text/a.txt'));
      });

      it('should receive the builder as an argument', function () {
        let mako = new Builder();

        mako[hook]('txt', function (file, tree, builder) {
          assert.strictEqual(builder, mako);
        });

        return mako.analyze(fixture('text/a.txt'));
      });

      it('should support multiple extensions', function () {
        let mako = new Builder();

        mako[hook]([ 'txt', 'md' ], function () {
          assert.isTrue(mako.hooks.has(hook, 'txt'));
        });

        return mako.analyze(fixture('text/a.txt'));
      });
    });
  });

  // write hooks
  [ 'postdependencies', 'prewrite', 'write', 'postwrite' ].forEach(function (hook) {
    describe(`#${hook}(type, handler)`, function () {
      it('should be called upon by build', function () {
        let called = [];
        let mako = new Builder();

        mako[hook]('txt', function () {
          called.push(hook);
        });

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should only be called on the file type specified', function () {
        let called = [];
        let mako = new Builder();

        mako[hook]('txt', function () {
          called.push(hook);
        });

        mako[hook]('js', function () {
          called.push(hook);
        });

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should call the handlers in the order they were defined', function () {
        let called = [];
        let mako = new Builder();

        mako[hook]('txt', function () {
          called.push(`${hook}1`);
        });

        mako[hook]('txt', function () {
          called.push(`${hook}2`);
        });

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ `${hook}1`, `${hook}2` ]);
        });
      });

      it('should allow async callback handlers', function () {
        let called = [];
        let mako = new Builder();

        mako[hook]('txt', function (file, tree, mako, done) {
          process.nextTick(function () {
            called.push(hook);
            done();
          });
        });

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should allow async generator handlers', function () {
        let called = [];
        let mako = new Builder();

        mako[hook]('txt', function* () {
          yield new Promise(function (done) {
            process.nextTick(function () {
              called.push(hook);
              done();
            });
          });
        });

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should allow async promise handlers', function () {
        let called = [];
        let mako = new Builder();

        mako[hook]('txt', function () {
          return new Promise(function (done) {
            process.nextTick(function () {
              called.push(hook);
              done();
            });
          });
        });

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ hook ]);
        });
      });

      it('should run async handlers in order', function () {
        let called = [];
        let mako = new Builder();

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

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ `${hook}1`, `${hook}2` ]);
        });
      });

      it('should receive the entry file as an argument', function () {
        let mako = new Builder();
        let entry = fixture('text/a.txt');

        mako[hook]('txt', function (file) {
          assert.equal(file.path, entry);
        });

        return mako.build(entry);
      });

      it('should receive the tree as an argument', function () {
        let mako = new Builder();

        mako[hook]('txt', function (file, tree) {
          assert.instanceOf(tree, Tree);
        });

        return mako.build(fixture('text/a.txt'));
      });

      it('should receive the builder as an argument', function () {
        let mako = new Builder();

        mako[hook]('txt', function (file, tree, builder) {
          assert.strictEqual(builder, mako);
        });

        return mako.build(fixture('text/a.txt'));
      });
    });
  });

  describe('#use(...plugins)', function () {
    it('should pass a function the builder instance', function () {
      let mako = new Builder();
      let called = false;
      mako.use(function (builder) {
        called = true;
        assert.strictEqual(builder, mako);
      });
      assert.isTrue(called);
    });

    it('should flatten the arguments into a single list', function () {
      let mako = new Builder();
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
      let mako = new Builder();
      assert.strictEqual(mako.use(plugin), mako);

      function plugin() {}
    });
  });

  describe('#analyze(...entries)', function () {
    it('should return a Promise', function () {
      let mako = new Builder();
      let entry = fixture('text/a.txt');
      assert.instanceOf(mako.analyze(entry), Promise);
    });

    it('should require the entry argument', function () {
      let mako = new Builder();
      return assert.isRejected(mako.analyze(), /^Error: an entry file is required$/);
    });

    it('should resolve with a tree instance', function () {
      let mako = new Builder();
      let entry = fixture('text/a.txt');
      assert.eventually.instanceOf(mako.analyze(entry), Tree);
    });

    it('should call the read/dependency hooks in order', function () {
      let called = [];
      let mako = new Builder();

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

    it('should share the arguments between the read/dependency hooks', function () {
      let mako = new Builder();
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
      let mako = new Builder();
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
      let mako = new Builder();
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
  });

  describe('#build(...entries)', function () {
    it('should return a Promise', function () {
      let mako = new Builder();
      let entry = fixture('text/a.txt');
      assert.instanceOf(mako.build(entry), Promise);
    });

    it('should require the entry argument', function () {
      let mako = new Builder();
      return assert.isRejected(mako.build(), /^Error: an entry file is required$/);
    });

    it('should resolve with a tree instance', function () {
      let mako = new Builder();
      let entry = fixture('text/a.txt');
      assert.eventually.instanceOf(mako.build(entry), Tree);
    });

    it('should call postdependencies in sequential order (not in parallel)', function () {
      // a -> b -> c
      let mako = new Builder();
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
      let mako = new Builder();

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
      let mako = new Builder();
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
      let mako = new Builder();
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
      let mako = new Builder();
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
  });
});
