'use strict';
var async = exports,
_Promise;

async.Promise = global.Promise;

// Use the promise polyfill for old versions of node.
/* istanbul ignore next */
if (!async.Promise) {
    async.Promise = require('promise-polyfill');
}

_Promise = async.Promise;

async.setPromise = function setPromise(newPromise) {
    async.Promise = newPromise;
};

async.resetPromise = function resetPromise() {
    async.Promise = _Promise;
};

function _thenable(fn, args) {
    try {
        var value = fn.apply(null, args || []),
            thenable = value;
        if (!value || typeof value.then !== 'function') {
            thenable = async.Promise.resolve(value);
        }
        return thenable;
    } catch (err) {
        return async.Promise.reject(err);
    }
}

function _each(obj, keys, limit, fn) {
    var result = Array.isArray(obj) ? [] : {},
        finished = 0,
        active = 0,
        index = 0,
        done = false;

    function generator() {
        var key = keys[index];
        index += 1;
        return {
            key: key,
            value: obj[key]
        };
    }

    return new Promise(function (resolve, reject) {
        function apply(item) {
            active += 1;
            _thenable(fn, [item.value, item.key, obj]).then(function (value) {
                result[item.key] = value;
                active -= 1;
                finished += 1;
                if (!done && finished === keys.length) {
                    done = true;
                    return resolve(result);
                }
                process.nextTick(spawn);
            }, function (err) {
                reject(err);
            });
        }

        function spawn() {
            while (!done && index < keys.length && active < limit) {
                var item = generator();
                apply(item);
            }
        }
        spawn();
    });
}

async.mapLimit = async.forEachLimit = async.eachLimit = function eachLimit(arr, limit, iterator) {
    if (Number.isNaN(Math.floor(limit))) {
        limit = 1; // Fallback if non number provided
    }
    if (!arr || arr.length === 0) {
        return async.Promise.resolve([]);
    }
    var keys = Object.keys(arr);
    if (keys.length === 0) {
        return async.Promise.resolve({});
    }
    return _each(arr, keys, limit, function (item) {
        return iterator(item);
    });
};

async.forEachOfLimit = function forEachOfLimit(arr, limit, iterator) {
    if (Number.isNaN(Math.floor(limit))) {
        limit = 1; // Fallback if non number provided
    }
    if (!arr || arr.length === 0) {
        return async.Promise.resolve([]);
    }
    var keys = Object.keys(arr);
    if (keys.length === 0) {
        return async.Promise.resolve({});
    }
    return _each(arr, keys, limit, iterator);
};

async.map = async.forEach = async.each = function each(arr, iterator) {
    return async.eachLimit(arr, Number.POSITIVE_INFINITY, iterator);
};

async.forEachOf = function forEachOf(arr, iterator) {
    return async.forEachOfLimit(arr, Number.POSITIVE_INFINITY, iterator);
};

async.mapSeries = async.forEachSeries = async.eachSeries = function eachSeries(arr, iterator) {
    return async.eachLimit(arr, 1, iterator);
};

async.forEachOfSeries = function forEachOfSeries(arr, iterator) {
    return async.forEachOfLimit(arr, 1, iterator);
};

function _filter(arr) {
    return function (values) {
        return async.Promise.resolve(arr.filter(function (_, index) {
            return values[index];
        }));
    };
}
async.filter = async.select = function select(arr, iterator) {
    return async.each(arr, iterator).then(_filter(arr));
};
async.filterSeries = async.selectSeries = function selectSeries(arr, iterator) {
    return async.eachSeries(arr, iterator).then(_filter(arr));
};
async.filterLimit = async.selectLimit = function selectLimit(arr, limit, iterator) {
    return async.eachLimit(arr, limit, iterator).then(_filter(arr));
};


function _reject(arr) {
    return function (values) {
        return async.Promise.resolve(arr.filter(function (_, index) {
            return !values[index];
        }));
    };
}
async.reject = function reject(arr, iterator) {
    return async.each(arr, iterator).then(_reject(arr));
};
async.rejectSeries = function rejectSeries(arr, limit, iterator) {
    return async.eachSeries(arr, limit, iterator).then(_reject(arr));
};
async.rejectLimit = function rejectLimit(arr, limit, iterator) {
    return async.eachLimit(arr, limit, iterator).then(_reject(arr));
};

function _detect(each, arr, iterator) {
    var breakEarly = new Error('early break'),
        result;

    function stepper(item) {
        return iterator(item).then(function (value) {
            if (value) {
                result = item;
                return async.Promise.reject(breakEarly);
            }
            return async.Promise.resolve(value);
        });
    }
    return each(arr, stepper).then(function () {
        return async.Promise.resolve(undefined);
    }).catch(function (err) {
        if (err === breakEarly) {
            return async.Promise.resolve(result);
        }
        return async.Promise.reject(err);
    });
}
async.detect = function detect(arr, iterator) {
    return _detect(async.each, arr, iterator);
};
async.detectSeries = function detectSeries(arr, iterator) {
    return _detect(async.eachSeries, arr, iterator);
};
async.detectLimit = function detectLimit(arr, limit, iterator) {
    return _detect(function (a, i) {
        return async.eachLimit(a, limit, i);
    }, arr, iterator);
};

async.foldl = async.reduce = function reduce(arr, start, iterator) {
    function stepper(item) {
        return iterator(start, item).then(function (value) {
            start = value;
            return async.Promise.resolve(value);
        });
    }
    return async.eachSeries(arr, stepper).then(function () {
        return async.Promise.resolve(start);
    });
};

async.foldr = async.reduceRight = function reduceRight(arr, start, iterator) {
    arr = (arr || []).reverse();
    return async.foldl(arr, start, iterator);
};

function _every(each, arr, iterator) {
    var breakEarly = new Error('early break');

    function stepper(item) {
        return iterator(item).then(function (value) {
            if (!value) {
                return async.Promise.reject(breakEarly);
            }
            return async.Promise.resolve(value);
        });
    }
    return each(arr, stepper).then(function () {
        return async.Promise.resolve(true);
    }).catch(function (err) {
        if (err === breakEarly) {
            return async.Promise.resolve(false);
        }
        return async.Promise.reject(err);
    });
}

async.all = async.every = function every(arr, iterator) {
    return _every(async.each, arr, iterator);
};
async.allSeries = async.everySeries = function everySeries(arr, iterator) {
    return _every(async.eachSeries, arr, iterator);
};
async.allLimit = async.everyLimit = function everyLimit(arr, limit, iterator) {
    return _every(function (a, i) {
        return async.eachLimit(a, limit, i);
    }, arr, iterator);
};

function _any(each, arr, iterator) {
    var breakEarly = new Error('early break');

    function stepper(item) {
        return iterator(item).then(function (value) {
            if (value) {
                return async.Promise.reject(breakEarly);
            }
            return async.Promise.resolve(value);
        });
    }
    return each(arr, stepper).then(function () {
        return async.Promise.resolve(false);
    }).catch(function (err) {
        if (err === breakEarly) {
            return async.Promise.resolve(true);
        }
        return async.Promise.reject(err);
    });
}

async.any = async.some = function some(arr, iterator) {
    return _any(async.each, arr, iterator);
};
async.anySeries = async.someSeries = function someSeries(arr, iterator) {
    return _any(async.eachSeries, arr, iterator);
};
async.anyLimit = async.someLimit = function someLimit(arr, limit, iterator) {
    return _any(function (a, i) {
        return async.eachLimit(a, limit, i);
    }, arr, iterator);
};

function _sorter(each, arr, iterator) {
    var original = (arr || []).map(function (value) {
        return {
            original: value,
            key: null
        };
    });
    return each(original, function (value, index) {
        return iterator(arr[index], index, arr).then(function (key) {
            value.key = key;
            return async.Promise.resolve(key);
        });
    }).then(function () {
        var sorted = original.sort(function (a, b) {
            if (a.key < b.key) {
                return -1;
            }
            if (a.key > b.key) {
                return 1;
            }
            return 0;
        });
        return async.Promise.resolve(sorted.map(function (value) {
            return value.original;
        }));
    });
}
async.sort = async.sortBy = function sortBy(arr, iterator) {
    return _sorter(async.forEachOf, arr, iterator);
};
async.sortSeries = async.sortBySeries = function sortBySeries(arr, iterator) {
    return _sorter(async.forEachOfSeries, arr, iterator);
};
async.sortLimit = async.sortByLimit = function sortByLimit(arr, limit, iterator) {
    return _sorter(function (a, i) {
        return async.forEachOfLimit(a, limit, i);
    }, arr, iterator);
};

function _concat(each, arr, iterator) {
    return each(arr, iterator).then(function (values) {
        var result = [].concat.apply([],
            values.map(function (item) {
                if (Array.isArray(item)) {
                    return item;
                }
                return [item];
            }));
        return async.Promise.resolve(result);
    });
}

async.concat = function concat(arr, iterator) {
    return _concat(async.each, arr, iterator);
};
async.concatSeries = function concatSeries(arr, iterator) {
    return _concat(async.eachSeries, arr, iterator);
};
async.concatLimit = function concatLimit(arr, limit, iterator) {
    return _concat(function (a, i) {
        return async.eachLimit(a, limit, i);
    }, arr, iterator);
};

function _runner(each, tasks) {
    function runner(fn) {
        return fn();
    }
    return each(tasks, runner);
}
async.series = function series(tasks) {
    return _runner(async.eachSeries, tasks);
};
async.parallel = function parallel(tasks) {
    return _runner(async.each, tasks);
};
async.parallelLimit = function parallelLimit(tasks, limit) {
    return _runner(function (a, i) {
        return async.eachLimit(a, limit, i);
    }, tasks);
};

async.waterfall = function waterfall(tasks, seed) {
    var arg = seed;

    function runner(fn) {
        return _thenable(fn, [arg]).then(function (value) {
            arg = value;
            return async.Promise.resolve(value);
        });
    }
    return async.eachSeries(tasks, runner).then(function () {
        return async.Promise.resolve(arg);
    });
};
async.seq = function seq(tasks) {
    return function (arg) {
        return async.waterfall(tasks, arg);
    };
};
async.compose = function compose(tasks) {
    tasks = [].slice.call(tasks);
    tasks.reverse();
    return function (arg) {
        return async.waterfall(tasks, arg);
    };
};

function _loop(test, fn, invert) {
    function truth(value) {
        return invert ? !value : value;
    }
    return new Promise(function (resolve, reject) {
        function apply() {
            _thenable(test).then(function (value) {
                if (truth(value)) {
                    _thenable(fn).then(function () {
                        process.nextTick(apply);
                    }, function (err) {
                        reject(err);
                    });
                } else {
                    resolve();
                }
            }, function (err) {
                reject(err);
            });
        }
        apply();
    });
}

async.forever = function forever(task) {
    return _loop(function () {
        return async.Promise.resolve(true);
    }, task);
};

async.during = async.whilst = function whilst(test, fn) {
    return _loop(test, fn);
};

async.until = function until(test, fn) {
    return _loop(test, fn, true);
};

async.doDuring = async.doWhilst = function doWhilst(fn, test) {
    var frist = true;
    return _loop(function () {
        return new Promise(function (resolve, reject) {
            if (frist) {
                frist = false;
                return resolve(true);
            }
            return _thenable(test).then(function (value) {
                resolve(value);
            }, reject);
        });
    }, fn);
};

async.doUntil = function doUntil(fn, test) {
    var frist = true;
    return _loop(function () {
        return new Promise(function (resolve, reject) {
            if (frist) {
                frist = false;
                return resolve(false);
            }
            _thenable(test).then(function (value) {
                resolve(value);
            }, reject);
        });
    }, fn, true);
};

function _times(each, n, fn) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
        n = 0;
    }
    n = Math.floor(n);
    if (n === 0) {
        return async.Promise.resolve([]);
    }
    var arr = Array.apply(null, Array(n)).map(function (_, i) {
        return i;
    });
    return each(arr, fn);
}
async.times = function times(n, fn) {
    return _times(async.each, n, fn);
};
async.timesSeries = function timesSeries(n, fn) {
    return _times(async.eachSeries, n, fn);
};
async.timesLimit = function timesLimit(n, limit, fn) {
    return _times(function (a, i) {
        return async.eachLimit(a, limit, i);
    }, n, fn);
};


async.apply = function apply(fn) {
    var args = [].slice.call(arguments);
    args.shift();
    return function () {
        var params = [].concat(args, [].slice.call(arguments));
        return _thenable(fn, params);
    };
};

function _applyEach(each, fns, args) {
    args = [].slice.call(args);
    args.shift();
    return function () {
        var params = [].concat(args, [].slice.call(arguments));
        return each(fns, function (fn) {
            return _thenable(fn, params);
        });
    };
}
async.applyEach = function applyEach(fns) {
    return _applyEach(async.each, fns, arguments);
};
async.applyEachSeries = function applyEachSeries(fns) {
    return _applyEach(async.eachSeries, fns, arguments);
};
async.applyEachLimit = function applyEachLimit(fns, limit) {
    var args = [].slice.call(arguments);
    args.shift();
    return _applyEach(function (a, i) {
        return async.eachLimit(a, limit, i);
    }, fns, args);
};

async.retry = function retry(opts, task) {
    var resolved = false,
        count = 0,
        value, err;
    if (typeof opts === 'function') {
        task = opts;
        opts = {
            times: 5,
            delay: 0
        };
    }
    if (opts === null || typeof opts !== 'object') {
        opts = {
            times: opts,
            delay: 0
        };
    }
    if (isNaN(opts.times) || opts.times < 0) {
        opts.times = 5;
    }
    if (isNaN(opts.delay) || opts.delay < 0) {
        opts.delay = 0;
    }
    return async.until(function () {
        return count >= opts.times || resolved;
    }, function () {
        count += 1;
        return _thenable(task).then(function (v) {
            resolved = true;
            value = v;
            err = null;
            return async.Promise.resolve();
        }, function (error) {
            resolved = false;
            value = null;
            err = error;
            return new async.Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, opts.delay);
            });
        });
    }).then(function () {
        if (err) {
            return async.Promise.reject(err);
        }
        return async.Promise.resolve(value);
    });
};

function _queue(worker, concurrency) {
    var workers = 0,
        q;

    function noop() {}

    function notify(fn, err, value) {
        if (typeof fn === 'function') {
            return fn(err, value);
        }
    }

    function taskify(tasks, progress, priority) {
        var result = {
            tasks: [],
            promises: []
        };
        tasks.forEach(function (task) {
            var fn, promise = new async.Promise(function (resolve, reject) {
                fn = function () {
                    return _thenable(worker, [task]).then(function (v) {
                        setImmediate(function () {
                            resolve(v);
                        });
                        return async.Promise.resolve(v);
                    }, function (e) {
                        setImmediate(function () {
                            reject(e);
                        });
                        return async.Promise.reject(e);
                    });
                };
                fn.priority = priority;
                fn.progress = progress;
            });
            result.tasks.push(fn);
            result.promises.push(promise);
        });
        return result;
    }

    function next() {
        function after() {
            workers -= 1;
            if (q._tasks.length === 0 && workers === 0) {
                notify(q.drain);
            }
            next();
        }

        function success(task) {
            return function (value) {
                notify(task.progress, null, value);
                after();
            };
        }

        function failure(task) {
            return function (value) {
                notify(task.progress, value);
                after();
            };
        }
        while (!q.paused && workers < q.concurrency && q._tasks.length > 0) {
            var task = q._tasks.shift();
            workers += 1;
            task().then(success(task), failure(task));
            if (q._tasks.length === 0) {
                notify(q.empty);
            }
            q.started = true;
        }
    }

    function addTasks(adder, tasks, progress, priority) {
        if (!Array.isArray(tasks)) {
            tasks = [tasks];
        }
        var t = taskify(tasks, progress, priority);
        adder.apply(q._tasks, t.tasks);
        if (q._tasks.length + workers >= q.concurrency) {
            notify(q.saturated);
        }
        return async.Promise.all(t.promises);
    }
    concurrency = Math.floor(concurrency);
    if (Number.isNaN(concurrency) || concurrency <= 0) {
        concurrency = 1;
    }
    q = {
        _tasks: [],
        concurrency: concurrency,
        started: false,
        length: function length() {
            return q._tasks.length;
        },
        running: function running() {
            return workers;
        },
        idle: function idle() {
            return q._tasks.length === 0 && workers === 0;
        },
        push: function push(tasks, progress) {
            var p = addTasks([].push, tasks, progress);
            q.process();
            return p;
        },
        unshift: function unshift(tasks, progress) {
            var p = addTasks([].unshift, tasks, progress);
            q.process();
            return p;
        },
        enqueue: function enqueue(tasks, priority, progress) {
            var p = addTasks([].push, tasks, progress, priority);
            return p;
        },
        process: function () {
            next();
        },
        paused: false,
        saturated: noop,
        empty: noop,
        drain: noop,
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            q.paused = false;
            q.process();
        },
        kill: function () {
            q.paused = true;
            q._tasks = [];
        }
    };
    return q;
}
async.queue = function queue(worker, concurrency) {
    var q = _queue(worker, concurrency);
    delete q.enqueue;
    return q;
};

async.priorityQueue = function priorityQueue(worker, concurrency) {
    var q = _queue(worker, concurrency);
    var add = q.enqueue;
    delete q.enqueue;
    delete q.unshift;
    q.push = function (tasks, priority, progress) {
        if (isNaN(priority) || Number.isNaN(priority)) {
            priority = 0;
        }
        var p = add(tasks, priority, progress);
        q._tasks.sort(function (a, b) {
            return a.priority - b.priority;
        });
        q.process();
        return p;
    };
    return q;
};

async.promisify = async.wrap = function wrap(obj, prop) {
    if (prop && typeof obj[prop] !== 'function') {
        throw new TypeError('Attempted to wrap ' + typeof obj[prop] + ' property ' + prop + ' as function');
    }
    var fn;
    if (!prop) {
        if (typeof obj !== 'function') {
            throw new TypeError('Attempted to wrap ' + typeof obj + ' value as function');
        }
        fn = obj;
    } else {
        fn = obj[prop].bind(obj);
    }
    return function (params) {
        params = [].slice.call(arguments);
        return new async.Promise(function (resolve, reject) {
            function after(err, value) {
                if (err) {
                    return reject(err);
                }
                value = [].slice.call(arguments);
                value.shift();
                if (value.length === 0) {
                    value = undefined;
                } else if (value.length === 1) {
                    value = value[0];
                }
                resolve(value);
            }
            params.push(after);
            try {
                fn.apply(null, params);
            } catch (e) {
                reject(e);
            }
        });
    };
};


async.later = async.delay = function delay(ms, value) {
    if (isNaN(ms)) {
        if (value === undefined) {
            value = ms;
            ms = undefined;
        } else {
            throw new TypeError('parameter ms must be a number, ' + typeof ms + ' was provided instead');
        }
    }
    if (ms === undefined) {
        ms = 100;
    }
    return new async.Promise(function (resolve) {
        setTimeout(function () {
            resolve(value);
        }, ms);
    });
};

async.constant = function constant(value) {
    return async.Promise.resolve(value);
};

async.fail = function fail(error) {
    return async.Promise.reject(error);
};
