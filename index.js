var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var parallel = require('run-parallel');

/**
  # rebuilder

  This is a simple and opionated tool that helps you run a devserver for
  building web applications and sites that use
  [browserify](https://github.com/substack/node-browserify) and
  [postcss](https://github.com/postcss/postcss).

  ## Why?

  Because I don't like writing build tasks for my web apps.

  ## Example Usage

  To be completed.
  
**/

module.exports = function(server, opts) {
  var cwd = (opts || {}).cwd || path.dirname(module.parent.filename);
  var srcPath = (opts || {}).src || path.resolve(cwd, 'src');
  var staticPath = (opts || {}).static || path.resolve(cwd, 'static');

  // initialise the actions
  var actions = ((opts || {}).actions || []).concat([
    [ /\.js$/i, require('./lib/browserify') ],
    [ /\.css$/i, require('./lib/cssnext') ]
  ]);

  var watcher = chokidar.watch(srcPath);
  var buildTasks = [];

  function createBuildTasks(filename) {
    return actions.map(function(action) {
      var match = action[0].exec(filename);
      if (match) {
        return action[1].bind(null, filename, 'foo', opts);
      }
    }).filter(Boolean);
  }

  function rebuild() {
    parallel(buildTasks, function(err, results) {
      if (err) {
        watcher.close();
        return console.error(err);
      }

      console.log('run rebuild');
    });
  }

  fs.readdir(srcPath, function(err, files) {
    buildTasks = (files || []).reduce(function(items, filename) {
      return items.concat(createBuildTasks(filename));
    }, []);

    // build the buildable files, and then start the server
    rebuild();
  });

  watcher.on('all', function(evt, filename) {
    console.log('file changed: ', evt, path.relative(srcPath, filename));
  });
};
