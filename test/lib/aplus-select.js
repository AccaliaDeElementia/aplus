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

describe('filter functions', function () {
    function testFilter(select) {
        it('should filter array values', function () {
            var input = [1, 2, 3, 4, 5],
                expected = [4, 5];

            function filter(i) {
                return Promise.resolve(i > 3);
            }
            return select(input, filter).then(function (values) {
                values.should.eql(expected);
            });
        });
        it('should reject on inner promise rejection', function () {
            var input = [1, 2, 3, 4, 5],
                expected = new Error('i am error' + Math.random());

            function filter() {
                return Promise.reject(expected);
            }
            return select(input, filter).then(function () {
                chai.assert.fail('Should not accept promise');
            }).catch(function (rejection) {
                rejection.should.equal(expected);
            });
        });
        it('should reject on inner promise thrown error', function () {
            var input = [1, 2, 3, 4, 5],
                expected = new Error('i am error' + Math.random());

            function filter() {
                throw expected;
            }

            return select(input, filter).then(function () {
                chai.assert.fail('Should not accept promise');
            }).catch(function (rejection) {
                rejection.should.equal(expected);
            });
        });
    }

    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'each');
        sandbox.spy(aplus, 'eachLimit');
        sandbox.spy(aplus, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    describe('aplus.selectLimit()', function () {
        it('should alias aplus.filterLimit to aplus.selectLimit', function () {
            aplus.filterLimit.should.equal(aplus.selectLimit);
        });
        it('should spawn Promises via aplus.eachLimit', function () {
            return aplus.selectLimit([1], 3, function () {
                return Promise.resolve(true);
            }).then(function () {
                aplus.eachLimit.called.should.equal(true);
            });
        });
        testFilter(function (arr, iterator) {
            return aplus.selectLimit(arr, 3, iterator);
        });
    });
    describe('aplus.select()', function () {
        it('should alias aplus.filter to aplus.select', function () {
            aplus.filter.should.equal(aplus.select);
        });
        it('should spawn Promises via aplus.eachLimit', function () {
            return aplus.select([1], function () {
                return Promise.resolve(true);
            }).then(function () {
                aplus.each.called.should.equal(true);
            });
        });
        testFilter(aplus.select);
    });
    describe('aplus.selectSeries()', function () {
        it('should alias aplus.filterSeries to aplus.selectSeries', function () {
            aplus.filterSeries.should.equal(aplus.selectSeries);
        });
        it('should spawn Promises via aplus.eachSeries', function () {
            return aplus.selectSeries([1], function () {
                return Promise.resolve(true);
            }).then(function () {
                aplus.eachSeries.called.should.equal(true);
            });
        });
        testFilter(aplus.selectSeries);
    });
});
