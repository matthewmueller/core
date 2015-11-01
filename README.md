# mako

> A pluggable build tool built around dependency trees.

[![npm version](https://img.shields.io/npm/v/mako.svg)](https://www.npmjs.com/package/mako)
[![npm dependencies](https://img.shields.io/david/makojs/core.svg)](https://david-dm.org/makojs/core)
[![npm dev dependencies](https://img.shields.io/david/dev/makojs/core.svg)](https://david-dm.org/makojs/core#info=devDependencies)
[![build status](https://img.shields.io/travis/makojs/core.svg)](https://travis-ci.org/makojs/core)

## What is this?

At it's core, mako is a build framework. On it's own, it is merely a conductor, and relies on
plugins to configure what and how it builds. As a user, you can either assemble plugins together
yourself, or simply use a bundled collection that is tailored to your use-case.

## How does it work?

The main flow for a mako build goes through 2 distinct phases: **analyze** and **build**.

The **analyze** phase reads a file from some source, (typically the local filesystem) identifies
dependencies for that file, then kicks off analyze recursively as new files are discovered.
Throughout this process, a **dependency tree** is being generated.

The **build** phase takes the tree generated by analyze, and outputs each file in the tree to some
destination. (typcially, also the local filesystem)

Throughout these phases, are steps called "hooks". Plugins add handlers for the hooks relevant to
the work it is doing, and register themselves _only_ for specific file extensions.

## About plugins

Plugins are **absolutely necessary** for mako to be useful. It was important for this tool to be
flexible, so much inspiration was taken from [Metalsmith](http://metalsmith.io/).

Keep an eye on [the wiki](http://github.com/makojs/core/wiki), I'll be working on adding more
resources about plugins.

## Usage

Currently, the only way to interact with mako is via the JS API. (with a CLI on it's way)

```js
var mako = require('mako');
var browser = require('mako-browser');

// create a new builder
mako()
  // add the browser plugin bundle
  .use(browser())
  // run the build for index.js (assumed to be in pwd)
  .build('./index.js')
  // returns a promise
  .then(function () {
    // done
  });
```

## API

### mako()

Returns a new `builder` instance, no need for the `new` keyword.

### builder.use(...plugins) *(chainable)*

Adds a new plugin to the builder. Each plugin is a `Function`, so any nested arrays will be
flattened, allowing you to nest freely. (particularly useful for bundles)

### builder.build(...entries)

The primary public interface, which runs both analysis and build for the given `entries`. It
returns a `Promise` that resolves with the final output tree.

### builder.analyze(...entries)

Runs an analysis on the passed `entries`. It returns a `Promise` that resolves with the generated
dependency tree.

This method isn't typically used directly, but it can be useful for reporting on the state of the
dependency tree without running the entire build process.
