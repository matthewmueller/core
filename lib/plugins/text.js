
var buffer = require('./buffer');
var stat = require('./stat');


module.exports = function (extensions) {
  if (!extensions) throw new Error('A file extension is required');

  return function (bundl) {
    bundl.use(stat(extensions));
    bundl.use(buffer(extensions));

    bundl.postread(extensions, function (file) {
      file.text = file.raw.toString();
    });
  };
};
