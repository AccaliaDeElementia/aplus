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
});
describe('aplus.eachSeries', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(aplus, 'eachLimit');
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
});

describe('aplus.each', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(aplus, 'eachLimit');
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
});
