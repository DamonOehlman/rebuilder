var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var parallel = require('run-parallel');
var debounce = require('lodash/function/debounce');
var pluck = require('whisk/pluck');

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

  var rebuild = debounce(buildFiles, 100);

  function createBuildTasks(filename) {
    return actions.map(function(action) {
      var match = action[0].exec(filename);
      var buildTask = match && action[1].bind(
        null,
        path.join(srcPath, filename),
        path.join(staticPath, filename),
        opts
      );

      return buildTask && [ buildTask, filename ];
    }).filter(Boolean);
  }

  function buildFiles() {
    var changed = false;
    var _rebuild = rebuild;

    // replace the rebuild function with a flag toggler
    rebuild = function() { changed = true };

    // run the build tasks
    parallel(buildTasks.map(pluck(0)), function(err, results) {
      if (err) {
        watcher.close();
        return console.error(err);
      }

      console.log('run rebuild');

      // replace the old rebuild
      rebuild = _rebuild;
      if (changed) {
        process.nextTick(rebuild);
      }
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
    var rel = path.relative(srcPath, filename);

    // if we have detected a new toplevel file, then add it to the build tasks
    if (path.dirname(rel) === '.') {
      if (evt === 'add') {
        buildTasks = buildTasks.concat(createBuildTasks(rel));
        rebuild();
      }
      else if (evt === 'unlink') {
        // remove the task that applies to the removed file
        buildTasks = buildTasks.filter(function(task) {
          return task[1] !== rel;
        });

        // remove the dist file
        fs.unlink(path.join(staticPath, rel), function(err) {
          // TODO: warn that a file removal failed
        });
        
        rebuild();
      }
    }

    console.log('file changed: ', evt, rel);
  });
};
