# mako

> A pluggable builder focused on assembling 1 file from many dependent files.

[![npm version](https://img.shields.io/npm/v/mako.svg)](https://www.npmjs.com/package/mako)
[![build status](https://img.shields.io/travis/makojs/core.svg)](https://travis-ci.org/makojs/core)

**NOTE:** this entire system is under heavy development, it is not ready for production use right now.

## What is this?

This build tool aims to be a generic interface for working with all sorts of build scenarios. The main focus in on taking a single "entry" file, finding it's entire tree of dependencies and outputting them after being transformed. (examples include [duo](http://duojs.org/) [browserify](http://browserify.org/))

## How does it work?

By itself, mako does very little, and relies on composing a lot of focused plugins. (inspired by [metalsmith](http://www.metalsmith.io/)) It goes through 2 distinct phases: "analyze" and "build". Along the way, plugins can use the exposed hooks for a given file extension.

Examples of "analyze" plugins include:

 - Checking for a file's existence via `fs.stat()`
 - Reading a file from disk, either as a string or buffer
 - Resolving CommonJS `require` statements in JS files
 - Resolving `@import` and `url(...)` links in CSS files
 - Resolving scripts, stylesheets and images in HTML files

During analysis, plugins are free to define dependencies on the tree, and mako will continue to traverse those new dependencies automatically.

Examples of "build" plugins include:

 - Inlining any `@import`-ed CSS
 - Copying/linking images/fonts/etc linked to in CSS files
 - Combining CommonJS modules into a single JS script
 - Minifying/compressing a file before write
 - Writing a file to disk
 - Uploading a file to S3

## Usage

The public interface uses Promises, to hopefully give the best amount of interoperability with other libraries.

```js
var mako = require('mako');
var browser = require('mako-browser');

mako()
  .use(browser())
  .build('./index.js')
  .then(function () {
    // done
  });
```

## API

### mako()

Returns a new builder instance, no need for the `new` keyword.

### builder.use(...plugins)

Adds a new plugin to the builder, this is **necessary** as mako does very little on it's own.

### builder.build(...entries)

The primary public interface, it takes the list of entry files and runs through all the defined plugins for both "read" and "write". The result is entirely dependent on the configured plugins.

### builder.analyze(...entries)

Returns a `Promise` that resolves with the generated `tree` of whatever entry files were passed. This only runs through the "read" phase, and can be used to do some reports and metrics on the tree.

### builder.{hook}(ext, handler)

Each of the 9 hooks has it's own dedicated method for adding `handler` functions.

## Hooks

Hooks are the primary mechanism that plugin authors will use. There are 3 main types of hooks, each with a `pre` and `post` variant, bringing the grand total to 9. It may seem like a lot, but each does have a distinct purpose that should make choosing the right one pretty straightforward:

### preread

This analyze hook can be used to check for existence, doing so explicitly will allow fast feedback for missing files.

### read

This analyze hook can be used to read the file from disk. (or downloaded from a remote source like S3)

### postread

This analyze hook can be used to run any sort of checksums or verifying that the read was successful.

### predependencies

This analyze hook can be used to do some minimal transpiling in order to make dependencies parseable. For example, a plugin that simply converts ES6 modules into CommonJS.

### dependencies

This analyze hook is where dependencies themselves are resolved, and where the tree will be augmented to mention those new dependencies.

### postdependencies

Unlike the other `dependencies` hooks, this one runs during the build phase. This hook will be run on all the files in a bottom-up order, and it can be use to unwind the newly created dependency tree. (such as assembling all CommonJS modules into a single output file)

### prewrite

This build hook can be used to do compression/minification on files before they are written to disk.

### write

This build hook performs the actual write, such as writing to disk or uploading to a remote source like S3.

### postwrite

This build hook can be used to checksum the output file to verify it was written correctly.
