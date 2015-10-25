
'use strict';

let flatten = require('array-flatten');


class Extensions {
  constructor() {
    this.manifest = new Map();
  }

  add(category, list) {
    if (!category) throw new Error('a category name is required');
    if (!this.manifest.has(category)) this.manifest.set(category, new Set());
    let set = this.manifest.get(category);
    if (list) flatten(list).forEach(extension => set.add(extension));
  }

  get(category) {
    if (!category) throw new Error('a category name is required');
    let set = this.manifest.get(category);
    return set ? Array.from(set) : [];
  }
}


module.exports = Extensions;
