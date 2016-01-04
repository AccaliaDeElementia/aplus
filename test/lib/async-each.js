'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    sinon = require('sinon');

if (!global.Promise) {
    global.Promise = require('promise-polyfill');
}
chai.use(chaiAsPromised);
chai.should();

var aplus = require('../../lib/aplus');

describe('aplus.eachLimit', function () {
    it('should alias aplus.eachLimit to aplus.forEachLimit', function () {
        aplus.forEachLimit.should.equal(aplus.eachLimit);
    });
    it('should alias aplus.eachLimit to aplus.mapLimit', function () {
        aplus.mapLimit.should.equal(aplus.eachLimit);
    });
    it('should accept empty array', function () {
        function square(i) {
            return Promise.resolve(i * i);
        }
        return aplus.eachLimit([], 4, square).then(function (values) {
            values.should.eql([]);
        });
    });
    it('should accept null array', function () {
        function square(i) {
            return Promise.resolve(i * i);
        }
        return aplus.eachLimit(null, 4, square).then(function (values) {
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
        return aplus.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should accept non number limit', function () {
        var input = [1, 2, 3, 4, 5];

        function square(i) {
            return Promise.resolve(i * i);
        }
        return aplus.eachLimit(input, undefined, square);
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
        return aplus.eachLimit(input, 4, square).then(function () {
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
        return aplus.eachLimit(input, 3, square).then(function () {
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
        return aplus.eachLimit(input, 3, filter).catch(function () {
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
        return aplus.eachLimit(input, 100, square).then(function () {
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
                return aplus.eachLimit(input, limit, square);
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
        return aplus.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return i * i;
        }
        return aplus.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('aplus.eachLimit() {object}', function () {
    it('should accept empty object values', function () {
        var input = {};
        return aplus.eachLimit(input, 5, function (i) {
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
        return aplus.eachLimit(input, 5, function (i) {
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
        return aplus.eachLimit(input, undefined, square);
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
        return aplus.eachLimit(input, 4, square).then(function () {
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
        return aplus.eachLimit(input, 3, square).then(function () {
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
        return aplus.eachLimit(input, 3, filter).catch(function () {
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
        return aplus.eachLimit(input, 100, square).then(function () {
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
                return aplus.eachLimit(input, limit, square);
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
        return aplus.eachLimit(input, 4, square).then(function (values) {
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
        return aplus.eachLimit(input, 4, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('aplus.eachSeries', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.eachSeries to aplus.forEachSeries', function () {
        aplus.forEachSeries.should.equal(aplus.eachSeries);
    });
    it('should alias aplus.eachSeries to aplus.mapSeries', function () {
        aplus.mapSeries.should.equal(aplus.eachSeries);
    });
    it('should proxy calls to aplus.eachLimit', function () {
        aplus.eachSeries([], sinon.spy());
        aplus.eachLimit.called.should.equal(true);
    });
    it('should pass array to aplus.eachLimit', function () {
        var arr = [1, 2, 3];
        aplus.eachSeries(arr, sinon.spy());
        aplus.eachLimit.firstCall.args[0].should.equal(arr);
    });
    it('should pass limit of 1 to aplus.eachLimit', function () {
        aplus.eachSeries([], sinon.spy());
        aplus.eachLimit.firstCall.args[1].should.equal(1);
    });
    it('should pass iterator to aplus.eachLimit', function () {
        var iterator = sinon.spy();
        aplus.eachSeries([], iterator);
        aplus.eachLimit.firstCall.args[2].should.equal(iterator);
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
        return aplus.eachSeries(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return i * i;
        }
        return aplus.eachSeries(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('aplus.eachSeries() {object}', function () {
    it('should accept empty object values', function () {
        var input = {};
        return aplus.eachSeries(input, function (i) {
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
        return aplus.eachSeries(input, function (i) {
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
        return aplus.eachSeries(input, square).then(function () {
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
        return aplus.eachSeries(input, square).then(function () {
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
        return aplus.eachSeries(input, filter).catch(function () {
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
        return aplus.eachSeries(input, square).then(function () {
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
        return aplus.eachSeries(input, square);
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
        return aplus.eachSeries(input, square).then(function (values) {
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
        return aplus.eachSeries(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('aplus.each', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.each to aplus.forEach', function () {
        aplus.forEach.should.equal(aplus.each);
    });
    it('should alias aplus.each to aplus.map', function () {
        aplus.map.should.equal(aplus.each);
    });
    it('should proxy calls to aplus.eachLimit', function () {
        aplus.each([], sinon.spy());
        aplus.eachLimit.called.should.equal(true);
    });
    it('should pass array to aplus.eachLimit', function () {
        var arr = [1, 2, 3];
        aplus.each(arr, sinon.spy());
        aplus.eachLimit.firstCall.args[0].should.equal(arr);
    });
    it('should pass limit of POSITIVE_INFINITY to aplus.eachLimit', function () {
        aplus.each([], sinon.spy());
        aplus.eachLimit.firstCall.args[1].should.equal(Number.POSITIVE_INFINITY);
    });
    it('should pass iterator to aplus.eachLimit', function () {
        var iterator = sinon.spy();
        aplus.each([], iterator);
        aplus.eachLimit.firstCall.args[2].should.equal(iterator);
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
        return aplus.each(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should behave when provided with a raw value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 4, 9, 16, 25];

        function square(i) {
            return i * i;
        }
        return aplus.each(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});

describe('aplus.each() {object}', function () {
    it('should accept empty object values', function () {
        var input = {};
        return aplus.each(input, function (i) {
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
        return aplus.each(input, function (i) {
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
        return aplus.each(input, square).then(function () {
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
        return aplus.each(input, square).then(function () {
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
        return aplus.each(input, square).then(function (values) {
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
        return aplus.each(input, square).then(function (values) {
            values.should.eql(expected);
        });
    });
});
