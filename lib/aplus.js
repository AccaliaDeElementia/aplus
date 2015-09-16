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

aplus.mapLimit = aplus.forEachLimit = aplus.eachLimit = function eachLimit(arr, limit, iterator) {
    if (Number.isNaN(Math.floor(limit))) {
        limit = 1; // Fallback if non number provided
    }
    if (!arr || arr.length === 0) {
        return Promise.resolve([]);
    }
    var keys = Object.keys(arr);
    if (keys.length === 0) {
        return Promise.resolve({});
    }
    return new aplus.Promise(function (resolve, reject) {
        var results = Array.isArray(arr) ? [] : {},
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
                results[keys[idx]] = value;
                active -= 1;
                finished += 1;
                if (!done && finished === keys.length) {
                    done = true;
                    return resolve(results);
                }
                spawn();
            };
        }

        function spawn() {
            while (!done && started < keys.length && active < limit) {
                var index = started;
                active += 1;
                started += 1;
                iterator(arr[keys[index]], keys[index], arr).then(getCompleter(index)).catch(onReject);
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
