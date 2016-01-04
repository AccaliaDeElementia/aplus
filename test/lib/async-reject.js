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


describe('reject functions', function () {
    function testReject(reject) {
        it('should filter array values', function () {
            var input = [1, 2, 3, 4, 5],
                expected = [1, 2, 3];

            function filter(i) {
                return Promise.resolve(i > 3);
            }
            return reject(input, filter).then(function (values) {
                values.should.eql(expected);
            });
        });
        it('should reject on inner promise rejection', function () {
            var input = [1, 2, 3, 4, 5],
                expected = new Error('i am error' + Math.random());

            function filter() {
                return Promise.reject(expected);
            }
            return reject(input, filter).then(function () {
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

            return reject(input, filter).then(function () {
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
    describe('async.rejectLimit()', function () {
        it('should spawn Promises via async.eachLimit', function () {
            return async.rejectLimit([1], 3, function () {
                return Promise.resolve(true);
            }).then(function () {
                async.eachLimit.called.should.equal(true);
            });
        });
        testReject(function (arr, iterator) {
            return async.rejectLimit(arr, 3, iterator);
        });
    });
    describe('async.reject()', function () {
        it('should spawn Promises via async.eachLimit', function () {
            return async.reject([1], function () {
                return Promise.resolve(true);
            }).then(function () {
                async.each.called.should.equal(true);
            });
        });
        testReject(async.reject);
    });
    describe('async.rejectSeries()', function () {
        it('should spawn Promises via async.eachSeries', function () {
            return async.rejectSeries([1], function () {
                return Promise.resolve(true);
            }).then(function () {
                async.eachSeries.called.should.equal(true);
            });
        });
        testReject(async.rejectSeries);
    });
});
