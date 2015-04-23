var fs = require('fs');
var path = require('path');
var cssnext = require('cssnext');
var postcss = require('postcss');
var parallel = require('run-parallel');
var out = require('out');

module.exports = function(src, dst, opts, callback) {
  var processor = postcss((opts || {}).postcssPlugins || [ require('cssnext') ]);
  var tasks;

  fs.readFile(src, { encoding: 'utf8' }, function(err, css) {
    if (err) {
      return callback(err);
    }

    processor
      .process(css, { from: path.basename(src), to: path.basename(dst) })
      .then(function (result) {
        var tasks = fs.writeFile.bind(null, dst, result.css);

        if (result.map) {
          tasks.push(fs.writeFile.bind(null, dst + '.map', result.map));
        }

        parallel(tasks, callback);
      });
  });
};
