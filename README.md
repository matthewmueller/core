# mako

> A pluggable builder focused on assembling 1 file from many dependent files.

**NOTE:** this entire system is under heavy development, it is not ready for production use right now.

## What is this?

This build tool aims to be a generic interface for working with all sorts of build scenarios. The main focus in on taking a single "entry" file, finding it's entire tree of dependencies and outputting them after being transformed. (examples include [duo](http://duojs.org/) [browserify](http://browserify.org/))

## How does it work?

By itself, mako does very little, and relies on composing a lot of focused plugins. (inspired by [metalsmith](http://www.metalsmith.io/)) It goes through 2 distinct phases: read and write. Along the way, plugins can hook into these phases for a given file extension.

Examples of "read phase" plugins include:

 - Resolving CommonJS `require` statements for JS files
 - Resolving `@import` and `url(...)` links in CSS files
 - Resolving scripts, stylesheets and images in HTML files

During the read phase, plugins are free to define dependencies on the tree, and mako will continue to traverse through those added dependencies until it reaches the end.

Examples of "write phase" plugins include:

 - Inlining any `@import`-ed CSS
 - Copying/linking images/fonts/etc linked to in CSS files
 - Combining CommonJS modules into a single JS script

As mentioned before, this is not ready for production use, and should largely be considered an experiment for the time-being.

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

### builder.<hook>(ext, handler)

Plugins can use the following hook methods to add new handlers.

 - `preread`
 - `read`
 - `postread`
 - `dependencies`
 - `prewrite`
 - `write`
 - `postwrite`

For a single file, all the hooks here will run in that order. During the read phase, the various read hooks will all be running in parallel as the tree is being constructed. Likewise, the various write hooks will be running in parallel with one another during the write phase.

### builder.extensions(entry, ...dependencies)

This internal mechanism is a way to associate different file extensions with one another so they can be resolved in mixed environments. (eg: associating "js" files with "coffee")
