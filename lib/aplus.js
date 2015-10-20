'use strict';
var aplus = exports,
    _Promise;

aplus.Promise = global.Promise;

// Use the promise polyfill for old versions of node.
/* istanbul ignore next */
if (!aplus.Promise) {
    aplus.Promise = require('promise-polyfill');
}

_Promise = aplus.Promise;

aplus.setPromise = function setPromise(newPromise) {
    aplus.Promise = newPromise;
};

aplus.resetPromise = function resetPromise() {
    aplus.Promise = _Promise;
};

function _thenable(fn, args) {
    try {
        var value = fn.apply(null, args || []),
            thenable = value;
        if (!value || typeof value.then !== 'function') {
            thenable = aplus.Promise.resolve(value);
        }
        return thenable;
    } catch (err) {
        return aplus.Promise.reject(err);
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

aplus.mapLimit = aplus.forEachLimit = aplus.eachLimit = function eachLimit(arr, limit, iterator) {
    if (Number.isNaN(Math.floor(limit))) {
        limit = 1; // Fallback if non number provided
    }
    if (!arr || arr.length === 0) {
        return aplus.Promise.resolve([]);
    }
    var keys = Object.keys(arr);
    if (keys.length === 0) {
        return aplus.Promise.resolve({});
    }
    return _each(arr, keys, limit, iterator);
};

aplus.map = aplus.forEach = aplus.each = function each(arr, iterator) {
    return aplus.eachLimit(arr, Number.POSITIVE_INFINITY, iterator);
};

aplus.mapSeries = aplus.forEachSeries = aplus.eachSeries = function eachSeries(arr, iterator) {
    return aplus.eachLimit(arr, 1, iterator);
};

function _filter(arr) {
    return function (values) {
        return aplus.Promise.resolve(arr.filter(function (_, index) {
            return values[index];
        }));
    };
}
aplus.filter = aplus.select = function select(arr, iterator) {
    return aplus.each(arr, iterator).then(_filter(arr));
};
aplus.filterSeries = aplus.selectSeries = function selectSeries(arr, iterator) {
    return aplus.eachSeries(arr, iterator).then(_filter(arr));
};
aplus.filterLimit = aplus.selectLimit = function selectLimit(arr, limit, iterator) {
    return aplus.eachLimit(arr, limit, iterator).then(_filter(arr));
};


function _reject(arr) {
    return function (values) {
        return aplus.Promise.resolve(arr.filter(function (_, index) {
            return !values[index];
        }));
    };
}
aplus.reject = function reject(arr, iterator) {
    return aplus.each(arr, iterator).then(_reject(arr));
};
aplus.rejectSeries = function rejectSeries(arr, limit, iterator) {
    return aplus.eachSeries(arr, limit, iterator).then(_reject(arr));
};
aplus.rejectLimit = function rejectLimit(arr, limit, iterator) {
    return aplus.eachLimit(arr, limit, iterator).then(_reject(arr));
};

function _detect(each, arr, iterator) {
    var breakEarly = new Error('early break'),
        result;

    function stepper(item) {
        return iterator(item).then(function (value) {
            if (value) {
                result = item;
                return aplus.Promise.reject(breakEarly);
            }
            return aplus.Promise.resolve(value);
        });
    }
    return each(arr, stepper).then(function () {
        return aplus.Promise.resolve(undefined);
    }).catch(function (err) {
        if (err === breakEarly) {
            return aplus.Promise.resolve(result);
        }
        return aplus.Promise.reject(err);
    });
}
aplus.detect = function detect(arr, iterator) {
    return _detect(aplus.each, arr, iterator);
};
aplus.detectSeries = function detectSeries(arr, iterator) {
    return _detect(aplus.eachSeries, arr, iterator);
};
aplus.detectLimit = function detectLimit(arr, limit, iterator) {
    return _detect(function (a, i) {
        return aplus.eachLimit(a, limit, i);
    }, arr, iterator);
};

aplus.foldl = aplus.reduce = function reduce(arr, start, iterator) {
    function stepper(item) {
        return iterator(start, item).then(function (value) {
            start = value;
            return aplus.Promise.resolve(value);
        });
    }
    return aplus.eachSeries(arr, stepper).then(function () {
        return aplus.Promise.resolve(start);
    });
};

aplus.foldr = aplus.reduceRight = function reduceRight(arr, start, iterator) {
    arr = (arr || []).reverse();
    return aplus.foldl(arr, start, iterator);
};

function _every(each, arr, iterator) {
    var breakEarly = new Error('early break');

    function stepper(item) {
        return iterator(item).then(function (value) {
            if (!value) {
                return aplus.Promise.reject(breakEarly);
            }
            return aplus.Promise.resolve(value);
        });
    }
    return each(arr, stepper).then(function () {
        return aplus.Promise.resolve(true);
    }).catch(function (err) {
        if (err === breakEarly) {
            return aplus.Promise.resolve(false);
        }
        return aplus.Promise.reject(err);
    });
}

aplus.all = aplus.every = function every(arr, iterator) {
    return _every(aplus.each, arr, iterator);
};
aplus.allSeries = aplus.everySeries = function everySeries(arr, iterator) {
    return _every(aplus.eachSeries, arr, iterator);
};
aplus.allLimit = aplus.everyLimit = function everyLimit(arr, limit, iterator) {
    return _every(function (a, i) {
        return aplus.eachLimit(a, limit, i);
    }, arr, iterator);
};

function _any(each, arr, iterator) {
    var breakEarly = new Error('early break');

    function stepper(item) {
        return iterator(item).then(function (value) {
            if (value) {
                return aplus.Promise.reject(breakEarly);
            }
            return aplus.Promise.resolve(value);
        });
    }
    return each(arr, stepper).then(function () {
        return aplus.Promise.resolve(false);
    }).catch(function (err) {
        if (err === breakEarly) {
            return aplus.Promise.resolve(true);
        }
        return aplus.Promise.reject(err);
    });
}

aplus.any = aplus.some = function some(arr, iterator) {
    return _any(aplus.each, arr, iterator);
};
aplus.anySeries = aplus.someSeries = function someSeries(arr, iterator) {
    return _any(aplus.eachSeries, arr, iterator);
};
aplus.anyLimit = aplus.someLimit = function someLimit(arr, limit, iterator) {
    return _any(function (a, i) {
        return aplus.eachLimit(a, limit, i);
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
            return aplus.Promise.resolve(key);
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
        return aplus.Promise.resolve(sorted.map(function (value) {
            return value.original;
        }));
    });
}
aplus.sort = aplus.sortBy = function sortBy(arr, iterator) {
    return _sorter(aplus.each, arr, iterator);
};
aplus.sortSeries = aplus.sortBySeries = function sortBySeries(arr, iterator) {
    return _sorter(aplus.eachSeries, arr, iterator);
};
aplus.sortLimit = aplus.sortByLimit = function sortByLimit(arr, limit, iterator) {
    return _sorter(function (a, i) {
        return aplus.eachLimit(a, limit, i);
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
        return aplus.Promise.resolve(result);
    });
}

aplus.concat = function concat(arr, iterator) {
    return _concat(aplus.each, arr, iterator);
};
aplus.concatSeries = function concatSeries(arr, iterator) {
    return _concat(aplus.eachSeries, arr, iterator);
};
aplus.concatLimit = function concatLimit(arr, limit, iterator) {
    return _concat(function (a, i) {
        return aplus.eachLimit(a, limit, i);
    }, arr, iterator);
};

function _runner(each, tasks) {
    function runner(fn) {
        return fn();
    }
    return each(tasks, runner);
}
aplus.series = function series(tasks) {
    return _runner(aplus.eachSeries, tasks);
};
aplus.parallel = function parallel(tasks) {
    return _runner(aplus.each, tasks);
};
aplus.parallelLimit = function parallelLimit(tasks, limit) {
    return _runner(function (a, i) {
        return aplus.eachLimit(a, limit, i);
    }, tasks);
};

aplus.waterfall = function waterfall(tasks, seed) {
    var arg = seed;

    function runner(fn) {
        return _thenable(fn, [arg]).then(function (value) {
            arg = value;
            return aplus.Promise.resolve(value);
        });
    }
    return aplus.eachSeries(tasks, runner).then(function () {
        return aplus.Promise.resolve(arg);
    });
};
aplus.seq = function seq(tasks) {
    return function (arg) {
        return aplus.waterfall(tasks, arg);
    };
};
aplus.compose = function compose(tasks) {
    tasks = [].slice.call(tasks);
    tasks.reverse();
    return function (arg) {
        return aplus.waterfall(tasks, arg);
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

aplus.forever = function forever(task) {
    return _loop(function () {
        return aplus.Promise.resolve(true);
    }, task);
};

aplus.during = aplus.whilst = function whilst(test, fn) {
    return _loop(test, fn);
};

aplus.until = function until(test, fn) {
    return _loop(test, fn, true);
};

aplus.doDuring = aplus.doWhilst = function doWhilst(fn, test) {
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

aplus.doUntil = function doUntil(fn, test) {
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
        return aplus.Promise.resolve([]);
    }
    var arr = Array.apply(null, Array(n)).map(function (_, i) {
        return i;
    });
    return each(arr, fn);
}
aplus.times = function times(n, fn) {
    return _times(aplus.each, n, fn);
};
aplus.timesSeries = function timesSeries(n, fn) {
    return _times(aplus.eachSeries, n, fn);
};
aplus.timesLimit = function timesLimit(n, limit, fn) {
    return _times(function (a, i) {
        return aplus.eachLimit(a, limit, i);
    }, n, fn);
};


aplus.apply = function apply(fn) {
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
aplus.applyEach = function applyEach(fns) {
    return _applyEach(aplus.each, fns, arguments);
};
aplus.applyEachSeries = function applyEachSeries(fns) {
    return _applyEach(aplus.eachSeries, fns, arguments);
};
aplus.applyEachLimit = function applyEachLimit(fns, limit) {
    var args = [].slice.call(arguments);
    args.shift();
    return _applyEach(function (a, i) {
        return aplus.eachLimit(a, limit, i);
    }, fns, args);
};

aplus.retry = function retry(opts, task) {
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
    return aplus.until(function () {
        return count >= opts.times || resolved;
    }, function () {
        count += 1;
        return _thenable(task).then(function (v) {
            resolved = true;
            value = v;
            err = null;
            return aplus.Promise.resolve();
        }, function (error) {
            resolved = false;
            value = null;
            err = error;
            return new aplus.Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, opts.delay);
            });
        });
    }).then(function () {
        if (err) {
            return aplus.Promise.reject(err);
        }
        return aplus.Promise.resolve(value);
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
            var fn, promise = new aplus.Promise(function (resolve, reject) {
                fn = function () {
                    return _thenable(worker, [task]).then(function (v) {
                        setImmediate(function () {
                            resolve(v);
                        });
                        return aplus.Promise.resolve(v);
                    }, function (e) {
                        setImmediate(function () {
                            reject(e);
                        });
                        return aplus.Promise.reject(e);
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
        return aplus.Promise.all(t.promises);
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
aplus.queue = function queue(worker, concurrency) {
    var q = _queue(worker, concurrency);
    delete q.enqueue;
    return q;
};

aplus.priorityQueue = function priorityQueue(worker, concurrency) {
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

aplus.promisify = aplus.wrap = function wrap(obj, prop) {
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
        return new aplus.Promise(function (resolve, reject) {
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


aplus.later = aplus.delay = function delay(ms, value) {
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
    return new aplus.Promise(function (resolve) {
        setTimeout(function () {
            resolve(value);
        }, ms);
    });
};

aplus.constant = function constant(value) {
    return aplus.Promise.resolve(value);
};

aplus.fail = function fail(error){
    return aplus.Promise.reject(error);
};
