compass-compiler
================

A standalone compiler for compass.

* NOTE the implement of this compiler is mostly modified from the source of [grunt-contrib-compass](https://github.com/gruntjs/grunt-contrib-compass)

## install

```js
npm install compass-compiler --save
```

## usage

```js

var compass = require( 'compass-compiler' );

compass.compile( options, function( err, result, code ){

    if (code === 127) {
        console.warn(
            'You need to have Ruby and Compass installed ' +
            'and in your system PATH for this task to work. '
        );
    }

    // `compass compile` exits with 1 and outputs "Nothing to compile"
    // on stderr when it has nothing to compile.
    // https://github.com/chriseppstein/compass/issues/993
    if (code === 1 && !/Nothing to compile|Compass can't find any Sass files to compile/g.test(result.stderr)) {
        console.warn('↑');
    }
});

```

## options

See [grunt-contrib-compass](https://github.com/gruntjs/grunt-contrib-compass#options) to get detail about the options.
