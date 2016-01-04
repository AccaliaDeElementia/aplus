'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised');

if (!global.Promise) {
    global.Promise = require('promise-polyfill');
}
chai.use(chaiAsPromised);
chai.should();

var async = require('../../lib/async-as-promised');
describe('aplus', function () {
    describe('setPromise()', function () {
        afterEach(function () {
            async.resetPromise();
        });
        it('should set async.Promise', function () {
            var value = Math.random();
            async.setPromise(value);
            async.Promise.should.equal(value);
        });
    });
    describe('resetPromise()', function () {
        afterEach(function () {
            async.resetPromise();
        });
        it('should restore async.Promise', function () {
            var value = async.Promise;
            async.Promise = Math.random();
            async.resetPromise();
            async.Promise.should.equal(value);
        });
    });
});
describe('async.constant()', function () {
    it('should return a Promise', function () {
        async.constant(5).should.be.an.instanceOf(Promise);
    });
    it('should resolve to provided value', function () {
        return async.constant(5).should.eventually.equal(5);
    });
});
describe('async.delay()', function () {
    it('should alias async.later to async.delay', function () {
        async.later.should.equal(async.delay);
    });
    it('should return a promise', function () {
        async.delay(1).should.be.an.instanceOf(Promise);
    });
    it('should resolve after delay', function () {
        var now = Date.now();
        return async.delay(500).then(function () {
            (Date.now() - now).should.be.at.least(499);
        });
    });
    it('should resolve using default delay if not specified', function () {
        var now = Date.now();
        return async.delay().then(function () {
            (Date.now() - now).should.be.at.least(99);
        });
    });
    it('should resolve using default delay when no parameters specified', function () {
        var now = Date.now();
        return async.delay().then(function () {
            (Date.now() - now).should.be.at.least(99);
        });
    });
    it('should resolve to `undefined` when no parameters specified', function () {
        return async.delay().then(function (value) {
            chai.expect(value).to.equal(undefined);
        });
    });
    it('should resolve using default delay when only value specified', function () {
        var now = Date.now();
        return async.delay('hi!').then(function () {
            (Date.now() - now).should.be.at.least(99);
        });
    });
    it('should resolve to value when only value specified', function () {
        return async.delay('hi!').then(function (value) {
            value.should.equal('hi!');
        });
    });
    it('should resolve using provided delay when delay and value specified', function () {
        var now = Date.now();
        return async.delay(200, 'bye!').then(function () {
            (Date.now() - now).should.be.at.least(199);
        });
    });
    it('should resolve to value when delay and value specified', function () {
        return async.delay(50, 'bye').then(function (value) {
            value.should.equal('bye');
        });
    });
    it('should throw exception when non number provided as delay and value is specified', function () {
        function test() {
            return async.delay('five seconds', 'hi!');
        }
        chai.expect(test).to.throw(TypeError);
    });
    it('should throw expected message for invalid delay', function () {
        function test() {
            return async.delay('five seconds', 'hi!');
        }
        chai.expect(test).to.throw('parameter ms must be a number, string was provided instead');
    });
});
