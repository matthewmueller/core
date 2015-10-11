
var fs = require('promised-io/fs');


module.exports = function (extensions) {
  if (!extensions) throw new Error('A file extension is required');

  return function (bundl) {
    bundl.read(extensions, function* (file) {
      file.raw = yield fs.readFile(file.path);
    });
  };
};
