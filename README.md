# rebuilder

This is a simple and opionated tool that helps you run a devserver for
building web applications and sites that use
[browserify](https://github.com/substack/node-browserify) and
[postcss](https://github.com/postcss/postcss).


[![NPM](https://nodei.co/npm/rebuilder.png)](https://nodei.co/npm/rebuilder/)

[![bitHound Score](https://www.bithound.io/github/DamonOehlman/rebuilder/badges/score.svg)](https://www.bithound.io/github/DamonOehlman/rebuilder) 

## Why?

Because I don't like writing build tasks for my web apps.

## Usage

Another convention over configuration tool (though you can configure it). Recommended project setup:

```
|- src/
|- static/
|- server.js
|- index.js
|- devserer.js
```

The entire `src/` directory will be watched for changes, but only **top-level** resources within that directory are actionable.  For example, if you have a directory with the following structure:

```
|- src
   |- lib
      |- foo.js
   |- index.js
   |- index.css
```

Both the `index.js` and the `index.css` would be considered directly actionable, while the `lib/foo.js` file would be assumed to be consumed by one of the actionable files.  Therefore, **any** changes to files within the source directory will trigger a rebuild of actionable files.  In most instances, a rebuild involves taking the input source file and generating an output file in the `static/` directory of the same name.

### Creating your application server files

Rather than creating a single `server.js` file which starts your application server, it is recommended that you create an `index.js` file that knows how to properly create a server instance.  For example:

```js
var http = require('http');

module.exports = function(opts) {
  var server = http.createServer(function(req, res) {
    res.end('ok');
  });

  return server;
};
```

Then the `server.js` file would look something like this:

```js
var server = require('./index')();

server.listen(3000);
```

Using this approach also allows you to create a `devserver.js` file and this is where `rebuilder` gets used:

```js
require('rebuilder')({ server: require('./index') });
```

This allows rebuilder to start the server once it believes that static resources are ready to be served, and also allows it to restart the server when those resources change. If this is the desired, behaviour then you can simply invoke `rebuilder` and not provide a `server` option.  If this is the case, you may choose to use the `NODE_ENV` environment variable and simply include rebuilder in the `server.js` file.


## License(s)

### ISC

Copyright (c) 2015, Damon Oehlman <damon.oehlman@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
