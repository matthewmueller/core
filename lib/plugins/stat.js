
var fs = require('promised-io/fs');


module.exports = function (extensions) {
  if (!extensions) throw new Error('A file extension is required');

  return function (mako) {
    mako.preread(extensions, function* (file) {
      file.stat = yield fs.stat(file.path);
    });
  };
};
