var cssnext = require('cssnext');
var postcss = require('postcss');

module.exports = function(src, dst, opts, callback) {
  var processor = postcss((opts || {}).postcssPlugins || [ require('cssnext') ]);

  // processor
  //   .process(css, { from: 'app.css', to: 'app.out.css' })
  //   .then(function (result) {
  //       fs.fileWriteSync('app.out.css', result.css);
  //       if ( result.map ) {
  //           fs.fileWriteSync('app.out.css.map', result.map);
  //       }
  //   });

  callback();
};
