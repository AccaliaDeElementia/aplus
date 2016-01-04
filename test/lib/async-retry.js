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
describe('async.retry()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should resolve once function resolves truthy', function () {
        var fn = sinon.stub();
        fn.returns(Promise.resolve(5));
        var p = async.retry(5, fn).then(function () {
            fn.callCount.should.equal(1);
        });
        return p;
    });
    it('should reject once retries expire and function rejects', function () {
        var fn = sinon.stub(),
            expected = new Error('i am evil error');
        fn.onThirdCall().returns(Promise.resolve(4));
        fn.returns(Promise.reject(expected));
        return async.retry(5, fn).then(function (value) {
            fn.callCount.should.equal(3);
            value.should.equal(4);
        });
    });
    it('should reject once retries expire and function rejects', function () {
        var fn = sinon.stub(),
            expected = new Error('i am evil error');
        fn.returns(Promise.reject(expected));
        return async.retry(5, fn).then(function () {
            chai.assert.fail('should not accept!');
        }).catch(function (err) {
            fn.callCount.should.equal(5);
            err.should.equal(expected);
        });
    });
    describe('times parameter sanity checks', function () {
        it('should use default number of times if opts omitted', function () {
            var fn = sinon.stub();
            fn.returns(Promise.reject(new Error('i am evil error')));
            return async.retry(fn).catch(function () {
                fn.callCount.should.equal(5);
            });
        });
        it('should use default number of times if NaN used for times', function () {
            var fn = sinon.stub();
            fn.returns(Promise.reject(new Error('i am evil error')));
            return async.retry(Number.NaN, fn).catch(function () {
                fn.callCount.should.equal(5);
            });
        });
        it('should use default number of times if negative number used for times', function () {
            var fn = sinon.stub();
            fn.returns(Promise.reject(new Error('i am evil error')));
            return async.retry(-3, fn).catch(function () {
                fn.callCount.should.equal(5);
            });
        });
        it('should use default times for undefined input', function () {
            var fn = sinon.stub();
            fn.returns(Promise.reject(new Error('i am evil error')));
            return async.retry(undefined, fn).catch(function () {
                fn.callCount.should.equal(5);
            });
        });
        it('should use default times for null input', function () {
            var fn = sinon.stub();
            fn.returns(Promise.reject(new Error('i am evil error')));
            return async.retry(null, fn).catch(function () {
                fn.callCount.should.equal(5);
            });
        });
        it('should use default times for empty object input', function () {
            var fn = sinon.stub();
            fn.returns(Promise.reject(new Error('i am evil error')));
            return async.retry({}, fn).catch(function () {
                fn.callCount.should.equal(5);
            });
        });
        it('should use integer parameter for times', function () {
            var fn = sinon.stub();
            fn.returns(Promise.reject(new Error('i am evil error')));
            return async.retry(3, fn).catch(function () {
                fn.callCount.should.equal(3);
            });
        });
        it('should use decimal parameter for times', function () {
            var fn = sinon.stub();
            fn.returns(Promise.reject(new Error('i am evil error')));
            return async.retry(6.34, fn).catch(function () {
                fn.callCount.should.equal(7);
            });
        });
    });
    it('should default to zero delay', function () {
        var fn = sinon.stub(),
            now = Date.now();
        fn.returns(Promise.reject(new Error('i am evil error')));
        return async.retry(3, fn).catch(function () {
            (Date.now() - now).should.be.at.most(20);
        });
    });
    it('should accept delay parameter', function () {
        var fn = sinon.stub(),
            now = Date.now();
        fn.returns(Promise.reject(new Error('i am evil error')));
        return async.retry({
            times: 5,
            delay: 100
        }, fn).catch(function () {
            (Date.now() - now).should.be.at.least(500);
        });
    });
});
