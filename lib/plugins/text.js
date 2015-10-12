
var buffer = require('./buffer');
var stat = require('./stat');


module.exports = function (extensions) {
  if (!extensions) throw new Error('A file extension is required');

  return function (mako) {
    mako.use(stat(extensions));
    mako.use(buffer(extensions));

    mako.postread(extensions, function (file) {
      file.text = file.raw.toString();
    });
  };
};
