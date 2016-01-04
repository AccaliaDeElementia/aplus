# async-as-promised

[![Build Status](https://travis-ci.org/AccaliaDeElementia/async-as-promised.svg?branch=master)](https://travis-ci.org/AccaliaDeElementia/async-as-promised)
[![NPM Version](https://img.shields.io/npm/v/async-as-promised.svg)](https://www.npmjs.com/package/async-as-promised)
[![Coverage Status](https://coveralls.io/repos/AccaliaDeElementia/async-as-promised/badge.svg?branch=master&service=github)](https://coveralls.io/github/AccaliaDeElementia/async-as-promised?branch=master)
[![Join the chat at https://gitter.im/AccaliaDeElementia/aplus](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/AccaliaDeElementia/aplus?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Dependency Status](https://david-dm.org/AccaliaDeElementia/async-as-promised/master.svg)](https://david-dm.org/AccaliaDeElementia/async-as-promised/master)
[![devDependency Status](https://david-dm.org/AccaliaDeElementia/async-as-promised/master/dev-status.svg)](https://david-dm.org/AccaliaDeElementia/async-as-promised/master#info=devDependencies)
[![optionalDependency Status](https://david-dm.org/AccaliaDeElementia/async-as-promised/master/optional-status.svg)](https://david-dm.org/AccaliaDeElementia/async-as-promised/master#info=optionalDependencies)

async-as-promised is a utility module that provides straight-forward, powerful functions for working with Promise based 
JavaScript.

The functions contained within this module are modeled off the API provided by @caolan's excellent 
[async](https://github.com/caolan/async) module. This module is intended to provide a similar API for working with 
Promise based modules as async provides for callback based modules.

async-as-promised provides over twenty functions that include the usual 'functional' suspects (`map`, `reduce`, 
`filter`, `each`…) as well as some common patterns for asynchronous control flow (`parallel`, `series`, `waterfall`…). 

## Quick Examples
```
var fs = require('fs');
var async = require('async-as-promised');
var statPromise = async.promisify(fs, fs.stat);
var existsPromise = async.promisify(fs, fs.exists);

async.map(['file1', 'file2', 'file3'], statPromise).then(function (results){
	// results is now an array of stats for each file
});

async.parallel([
	function(){}, // Functions that return promises when called
	function(){},
	function(){}
]).then(function (results){
	// results is an array of the values the provided functions eventually resolved to.
});

async.series([ // Like async.parallel, except each function will be run only after the previous one has resolved
	function(){}, // Functions that return promises when called
	function(){},
	function(){}
]).then(function (results){
	// results is an array of the values the provided functions eventually resolved to.
});

```

## Binding context to a function

This section is really about bind, not about async-as-promised. If you are wondering how to make async-as-promised 
execute your iterators in a given context, or are confused as to why a method of another library isn't working as an 
iterator, study this example:

```
// Here is a simple object with an (unnecessarily roundabout) squaring method
var PromiseSquaringLibrary = {
  squareExponent: 2,
  square: function(number, callback){
    var result = Math.pow(number, this.squareExponent);
    return Promise.resolve(result);
  }
};

async.map([1, 2, 3], PromiseSquaringLibrary.square).then(function (result) {
  // result is [NaN, NaN, NaN]
  // This fails because the `this.squareExponent` expression in the square
  // function is not evaluated in the context of PromiseSquaringLibrary, and is
  // therefore undefined.
});

async.map([1, 2, 3], PromiseSquaringLibrary.square.bind(PromiseSquaringLibrary),).then(function(result) {
  // result is [1, 4, 9]
  // With the help of bind we can attach a context to the iterator before
  // passing it to async. Now the square function will be executed in its
  // 'home' PromiseSquaringLibrary context and the value of `this.squareExponent`
  // will be as expected.
});
```

## Download
The source is available for download from [GitHub](https://github.com/AccaliaDeElementia/async-as-promised).
Alternatively, you can install using Node package manager (`npm`):
```
npm install async-as-promised
```

## Using other Promise Libraries
By default async-as-promised uses the global default Promise object (falling back to 
[promise-polyfill](https://www.npmjs.com/package/promise-polyfill) if there is no global Promise object). However 
async-as-promised supports using any [promises/A+](https://promisesasync.com/) compliant promise library, such as 
[bluebird](http://bluebirdjs.com/docs/getting-started.html)

To change the Promise library used async-as-promised use the `setPromise()` method as shown below:
```
var async = require('async-as-promised');
var bluebird = require('bluebird');

async.setPromise(bluebird);
// async-as-promised will now use bluebird promises for all functions

// to return to the default Promise type simply reset the Promise:
async.resetPromise();
```


