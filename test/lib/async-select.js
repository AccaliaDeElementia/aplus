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
        sandbox.spy(async, 'each');
        sandbox.spy(async, 'eachLimit');
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    describe('async.selectLimit()', function () {
        it('should alias async.filterLimit to async.selectLimit', function () {
            async.filterLimit.should.equal(async.selectLimit);
        });
        it('should spawn Promises via async.eachLimit', function () {
            return async.selectLimit([1], 3, function () {
                return Promise.resolve(true);
            }).then(function () {
                async.eachLimit.called.should.equal(true);
            });
        });
        testFilter(function (arr, iterator) {
            return async.selectLimit(arr, 3, iterator);
        });
    });
    describe('async.select()', function () {
        it('should alias async.filter to async.select', function () {
            async.filter.should.equal(async.select);
        });
        it('should spawn Promises via async.eachLimit', function () {
            return async.select([1], function () {
                return Promise.resolve(true);
            }).then(function () {
                async.each.called.should.equal(true);
            });
        });
        testFilter(async.select);
    });
    describe('async.selectSeries()', function () {
        it('should alias async.filterSeries to async.selectSeries', function () {
            async.filterSeries.should.equal(async.selectSeries);
        });
        it('should spawn Promises via async.eachSeries', function () {
            return async.selectSeries([1], function () {
                return Promise.resolve(true);
            }).then(function () {
                async.eachSeries.called.should.equal(true);
            });
        });
        testFilter(async.selectSeries);
    });
});
