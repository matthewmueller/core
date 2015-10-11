
'use strict';

let chai = require('chai');
let Builder = require('../lib/builder');
let jsdom = require('jsdom');
let path = require('path');
let plugins = require('../lib/plugins');

chai.use(require('chai-as-promised'));
let assert = chai.assert;
let fixture = path.resolve.bind(path, __dirname, 'examples');

describe('examples', function () {
  describe('html', function () {
    let bundl = new Builder();

    bundl.use(function (bundl) {
      // html
      bundl.use(plugins.text('html'));
      bundl.dependencies('html', function (file, tree, bundl, done) {
        jsdom.env(file.text, function (err, window) {
          if (err) done(err);

          Array.from(window.document.querySelectorAll('script')).forEach(function (script) {
            tree.addDependency(file.path, path.resolve(path.dirname(file.path), script.src));
          });

          Array.from(window.document.querySelectorAll('link[rel=stylesheet]')).forEach(function (link) {
            tree.addDependency(file.path, path.resolve(path.dirname(file.path), link.href));
          });

          done();
        });
      });

      // js
      bundl.use(plugins.text('js'));

      // css
      bundl.use(plugins.text('css'));
    });

    it('should analyze and generate the expected tree', function () {
      return bundl.analyze(fixture('html/index.html')).then(function (tree) {
        let html = fixture('html/index.html');
        let js = fixture('html/index.js');
        let css = fixture('html/index.css');

        assert.isTrue(tree.hasNode(html));
        assert.isTrue(tree.hasNode(js));
        assert.isTrue(tree.hasNode(css));

        assert.isTrue(tree.hasDependency(html, js));
        assert.isTrue(tree.hasDependency(html, css));
      });
    });
  });
});
