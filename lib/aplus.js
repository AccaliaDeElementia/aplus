'use strict';

var aplus = exports;

aplus.Promise = global.Promise;

// Use the promise polyfill for old versions of node.
/* istanbul ignore next */
if (!aplus.Promise) {
    aplus.Promise = require('promise-polyfill');
}

aplus.mapLimit = aplus.forEachLimit = aplus.eachLimit = function eachLimit(arr, limit, iterator) {
    if (Number.isNaN(Math.floor(limit))) {
        limit = 1; // Fallback if non number provided
    }
    if (!arr || arr.length === 0) {
        return Promise.resolve([]);
    }
    return new aplus.Promise(function (resolve, reject) {
        var results = [],
            finished = 0,
            started = 0,
            active = 0,
            done = false;

        function onReject(error) {
            done = true;
            reject(error);
        }

        function getCompleter(idx) {
            return function onComplete(value) {
                results[idx] = value;
                active -= 1;
                finished += 1;
                if (!done && finished === arr.length) {
                    done = true;
                    return resolve(results);
                }
                spawn();
            };
        }

        function spawn() {
            while (!done && started < arr.length && active < limit) {
                var index = started;
                active += 1;
                started += 1;
                iterator(arr[index], index, arr).then(getCompleter(index)).catch(onReject);
            }
        }
        spawn();
    });
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

function _reject(arr) {
    return function (values) {
        return aplus.Promise.resolve(arr.filter(function (_, index) {
            return !values[index];
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

aplus.reject = function reject(arr, iterator) {
    return aplus.each(arr, iterator).then(_reject(arr));
};
aplus.rejectSeries = function rejectSeries(arr, limit, iterator) {
    return aplus.eachSeries(arr, limit, iterator).then(_reject(arr));
};
aplus.rejectLimit = function rejectLimit(arr, limit, iterator) {
    return aplus.eachLimit(arr, limit, iterator).then(_reject(arr));
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
    return each(arr, stepper).then(function (values) {
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
