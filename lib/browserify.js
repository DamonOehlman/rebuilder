var out = require('out');
var browserify = require('browserify');
var fs = require('fs');

module.exports = function(src, dst, opts, callback) {
  var b = browserify(src, opts);

  return b.bundle()
    .pipe(fs.createWriteStream(dst))
    .on('error', callback)
    .on('finish', callback);
};
