'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    sinon = require('sinon');

if (!global.Promise) {
    global.Promise = require('promise-polyfill');
}
chai.use(chaiAsPromised);
chai.should();

var async = require('../../lib/async-as-promised');

describe('async.eachLimit', function () {
    it('should alias async.eachLimit to async.forEachLimit', function () {
        async.forEachLimit.should.equal(async.eachLimit);
    });
    it('should alias async.eachLimit to async.mapLimit', function () {
        async.mapLimit.should.equal(async.eachLimit);
    });
    it('should accept empty array', function () {
        function square(i) {
            return Promise.resolve(i * i);
        }
        return async.eachLimit([], 4, square).then(function (values) {
            values.should.eql([]);
        });
    });
    it('should accept null array', function () {
        function square(i) {
            return Promise.resolve(i * i);
        }
        return async.eachLimit(null, 4, square).then(function (values) {
            values.should.eql([]);
        });
    });
    it('should map array values', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return new Promise(function (resolve) {
                resolve(i * i);
            });
        }
        return async.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should accept non number limit', function () {
        var input = [1, 2, 3, 4, 5];

        function square(i) {
            return Promise.resolve(i * i);
        }
        return async.eachLimit(input, undefined, square);
    });
    it('should reject on inner promise rejection', function () {
        var input = [1, 2, 3, 4, 5],
            expected = new Error('i am error' + Math.random());

        function square(i) {
            return new Promise(function (resolve, reject) {
                if (i === 2) {
                    reject(expected);
                } else {
                    resolve(i * i);
                }
            });
        }
        return async.eachLimit(input, 4, square).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (rejection) {
            rejection.should.equal(expected);
        });
    });
    it('should reject on inner promise thrown error', function () {
        var input = [1, 2, 3, 4, 5],
            expected = new Error('i am error' + Math.random());

        function square(i) {
            return new Promise(function (resolve) {
                if (i === 3) {
                    throw expected;
                } else {
                    resolve(i * i);
                }
            });
        }
        return async.eachLimit(input, 3, square).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (rejection) {
            rejection.should.equal(expected);
        });
    });
    it('should not spawn promises after rejection occurs', function () {
        var input = [],
            promises = 0,
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input.push(i);
        }

        function filter() {
            promises += 1;
            if (promises === 3) {
                return Promise.reject(new Error('boo'));
            }
            return Promise.resolve(true);
        }
        return async.eachLimit(input, 3, filter).catch(function () {
            promises.should.be.below(length);
        });
    });
    it('should spawn only as many Promises as input items', function () {
        var input = [1, 2, 3, 4, 5],
            promises = 0;

        function square(i) {
            return new Promise(function (resolve) {
                promises += 1;
                resolve(i * i);

            });
        }
        return async.eachLimit(input, 100, square).then(function () {
            promises.should.equal(input.length);
        });
    });
    describe('should spawn only up to the provided limit of promises', function () {
        var input = [],
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input.push(i);
        }
        input.forEach(function (limit) {
            it('limit: ' + limit, function () {
                var activePromises = 0;

                function square(j) {
                    return new Promise(function (resolve) {
                        activePromises++;
                        activePromises.should.be.at.most(limit);
                        resolve(j * j);
                    }).then(function (value) {
                        activePromises--;
                        return Promise.resolve(value);
                    });
                }
                return async.eachLimit(input, limit, square);
            });
        });
    });
    it('should behave when provided with a thenable', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return {
                then: function (resolve) {
                    resolve(i * i);
                }
            };
        }
        return async.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return i * i;
        }
        return async.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('async.eachLimit() {object}', function () {
    it('should accept empty object values', function () {
        var input = {};
        return async.eachLimit(input, 5, function (i) {
            return Promise.resolve(i * i);
        });
    });
    it('should map object values', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };
        return async.eachLimit(input, 5, function (i) {
            return Promise.resolve(i * i);
        }).then(function (result) {
            result.should.eql(expected);
        });
    });

    it('should accept non number limit', function () {
        var input = {
            first: 1,
            second: 2,
            third: 3
        };

        function square(i) {
            return Promise.resolve(i * i);
        }
        return async.eachLimit(input, undefined, square);
    });
    it('should reject on inner promise rejection', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = new Error('i am error' + Math.random());

        function square(i) {
            return new Promise(function (resolve, reject) {
                if (i === 2) {
                    reject(expected);
                } else {
                    resolve(i * i);
                }
            });
        }
        return async.eachLimit(input, 4, square).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (rejection) {
            rejection.should.equal(expected);
        });
    });
    it('should reject on inner promise thrown error', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = new Error('i am error' + Math.random());

        function square(i) {
            return new Promise(function (resolve) {
                if (i === 3) {
                    throw expected;
                } else {
                    resolve(i * i);
                }
            });
        }
        return async.eachLimit(input, 3, square).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (rejection) {
            rejection.should.equal(expected);
        });
    });
    it('should not spawn promises after rejection occurs', function () {
        var input = {},
            promises = 0,
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input['a' + i] = i;
        }

        function filter(j) {
            promises += 1;
            if (j === 10) {
                return Promise.reject(new Error('boo'));
            }
            return Promise.resolve(true);
        }
        return async.eachLimit(input, 3, filter).catch(function () {
            promises.should.be.below(length);
        });
    });
    it('should spawn only as many Promises as input items', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            promises = 0;

        function square(i) {
            return new Promise(function (resolve) {
                promises += 1;
                resolve(i * i);

            });
        }
        return async.eachLimit(input, 100, square).then(function () {
            promises.should.equal(3);
        });
    });
    describe('should spawn only up to the provided limit of promises', function () {
        var input = {},
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input['a' + i] = i;
        }
        Object.keys(input).forEach(function (key) {
            var limit = input[key];
            it('limit: ' + limit, function () {
                var activePromises = 0;

                function square(j) {
                    return new Promise(function (resolve) {
                        activePromises++;
                        activePromises.should.be.at.most(limit);
                        resolve(j * j);
                    }).then(function (value) {
                        activePromises--;
                        return Promise.resolve(value);
                    });
                }
                return async.eachLimit(input, limit, square);
            });
        });
    });
    it('should behave when provided with a thenable', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };

        function square(i) {
            return {
                then: function (resolve) {
                    resolve(i * i);
                }
            };
        }
        return async.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };

        function square(i) {
            return i * i;
        }
        return async.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('async.eachSeries', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.eachSeries to async.forEachSeries', function () {
        async.forEachSeries.should.equal(async.eachSeries);
    });
    it('should alias async.eachSeries to async.mapSeries', function () {
        async.mapSeries.should.equal(async.eachSeries);
    });
    it('should proxy calls to async.eachLimit', function () {
        async.eachSeries([], sinon.spy());
        async.eachLimit.called.should.equal(true);
    });
    it('should pass array to async.eachLimit', function () {
        var arr = [1, 2, 3];
        async.eachSeries(arr, sinon.spy());
        async.eachLimit.firstCall.args[0].should.equal(arr);
    });
    it('should pass limit of 1 to async.eachLimit', function () {
        async.eachSeries([], sinon.spy());
        async.eachLimit.firstCall.args[1].should.equal(1);
    });
    it('should pass iterator to async.eachLimit', function () {
        var iterator = sinon.spy();
        async.eachSeries([], iterator);
        async.eachLimit.firstCall.args[2].should.equal(iterator);
    });
    it('should behave when provided with a thenable', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return {
                then: function (resolve) {
                    resolve(i * i);
                }
            };
        }
        return async.eachSeries(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return i * i;
        }
        return async.eachSeries(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('async.eachSeries() {object}', function () {
    it('should accept empty object values', function () {
        var input = {};
        return async.eachSeries(input, function (i) {
            return Promise.resolve(i * i);
        });
    });
    it('should map object values', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };
        return async.eachSeries(input, function (i) {
            return Promise.resolve(i * i);
        }).then(function (result) {
            result.should.eql(expected);
        });
    });
    it('should reject on inner promise rejection', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = new Error('i am error' + Math.random());

        function square(i) {
            return new Promise(function (resolve, reject) {
                if (i === 2) {
                    reject(expected);
                } else {
                    resolve(i * i);
                }
            });
        }
        return async.eachSeries(input, square).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (rejection) {
            rejection.should.equal(expected);
        });
    });
    it('should reject on inner promise thrown error', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = new Error('i am error' + Math.random());

        function square(i) {
            return new Promise(function (resolve) {
                if (i === 3) {
                    throw expected;
                } else {
                    resolve(i * i);
                }
            });
        }
        return async.eachSeries(input, square).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (rejection) {
            rejection.should.equal(expected);
        });
    });
    it('should not spawn promises after rejection occurs', function () {
        var input = {},
            promises = 0,
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input['a' + i] = i;
        }

        function filter(j) {
            promises += 1;
            if (j === 10) {
                return Promise.reject(new Error('boo'));
            }
            return Promise.resolve(true);
        }
        return async.eachSeries(input, filter).catch(function () {
            promises.should.equal(10);
        });
    });
    it('should spawn only as many Promises as input items', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            promises = 0;

        function square(i) {
            return new Promise(function (resolve) {
                promises += 1;
                resolve(i * i);

            });
        }
        return async.eachSeries(input, square).then(function () {
            promises.should.equal(3);
        });
    });
    it('should spawn only up to the provided limit of promises', function () {
        var input = {},
            activePromises = 0,
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input['a' + i] = i;
        }

        function square(j) {
            return new Promise(function (resolve) {
                activePromises++;
                activePromises.should.be.at.most(1);
                resolve(j * j);
            }).then(function (value) {
                activePromises--;
                return Promise.resolve(value);
            });
        }
        return async.eachSeries(input, square);
    });
    it('should behave when provided with a thenable', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };

        function square(i) {
            return {
                then: function (resolve) {
                    resolve(i * i);
                }
            };
        }
        return async.eachSeries(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };

        function square(i) {
            return i * i;
        }
        return async.eachSeries(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('async.each', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.each to async.forEach', function () {
        async.forEach.should.equal(async.each);
    });
    it('should alias async.each to async.map', function () {
        async.map.should.equal(async.each);
    });
    it('should proxy calls to async.eachLimit', function () {
        async.each([], sinon.spy());
        async.eachLimit.called.should.equal(true);
    });
    it('should pass array to async.eachLimit', function () {
        var arr = [1, 2, 3];
        async.each(arr, sinon.spy());
        async.eachLimit.firstCall.args[0].should.equal(arr);
    });
    it('should pass limit of POSITIVE_INFINITY to async.eachLimit', function () {
        async.each([], sinon.spy());
        async.eachLimit.firstCall.args[1].should.equal(Number.POSITIVE_INFINITY);
    });
    it('should pass iterator to async.eachLimit', function () {
        var iterator = sinon.spy();
        async.each([], iterator);
        async.eachLimit.firstCall.args[2].should.equal(iterator);
    });
    it('should behave when provided with a thenable', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return {
                then: function (resolve) {
                    resolve(i * i);
                }
            };
        }
        return async.each(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return i * i;
        }
        return async.each(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});

describe('async.each() {object}', function () {
    it('should accept empty object values', function () {
        var input = {};
        return async.each(input, function (i) {
            return Promise.resolve(i * i);
        });
    });
    it('should map object values', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };
        return async.each(input, function (i) {
            return Promise.resolve(i * i);
        }).then(function (result) {
            result.should.eql(expected);
        });
    });
    it('should reject on inner promise rejection', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = new Error('i am error' + Math.random());

        function square(i) {
            return new Promise(function (resolve, reject) {
                if (i === 2) {
                    reject(expected);
                } else {
                    resolve(i * i);
                }
            });
        }
        return async.each(input, square).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (rejection) {
            rejection.should.equal(expected);
        });
    });
    it('should reject on inner promise thrown error', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = new Error('i am error' + Math.random());

        function square(i) {
            return new Promise(function (resolve) {
                if (i === 3) {
                    throw expected;
                } else {
                    resolve(i * i);
                }
            });
        }
        return async.each(input, square).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (rejection) {
            rejection.should.equal(expected);
        });
    });
    it('should behave when provided with a thenable', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };

        function square(i) {
            return {
                then: function (resolve) {
                    resolve(i * i);
                }
            };
        }
        return async.each(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = {
                first: 1,
                second: 2,
                third: 3
            },
            expected = {
                first: 1,
                second: 4,
                third: 9
            };

        function square(i) {
            return i * i;
        }
        return async.each(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
