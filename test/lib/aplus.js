'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised');

if (!global.Promise) {
    global.Promise = require('promise-polyfill');
}
chai.use(chaiAsPromised);
chai.should();

var aplus = require('../../lib/aplus');
describe('aplus', function () {
    describe('setPromise()', function () {
        afterEach(function () {
            aplus.resetPromise();
        });
        it('should set aplus.Promise', function () {
            var value = Math.random();
            aplus.setPromise(value);
            aplus.Promise.should.equal(value);
        });
    });
    describe('resetPromise()', function () {
        afterEach(function () {
            aplus.resetPromise();
        });
        it('should restore aplus.Promise', function () {
            var value = aplus.Promise;
            aplus.Promise = Math.random();
            aplus.resetPromise();
            aplus.Promise.should.equal(value);
        });
    });
});
describe('aplus.constant()', function () {
    it('should return a Promise', function () {
        aplus.constant(5).should.be.an.instanceOf(Promise);
    });
    it('should resolve to provided value', function () {
        return aplus.constant(5).should.eventually.equal(5);
    });
});
describe('aplus.delay()', function () {
    it('should alias aplus.later to aplus.delay', function () {
        aplus.later.should.equal(aplus.delay);
    });
    it('should return a promise', function () {
        aplus.delay(1).should.be.an.instanceOf(Promise);
    });
    it('should resolve after delay', function () {
        var now = Date.now();
        return aplus.delay(500).then(function () {
            (Date.now() - now).should.be.at.least(500);
        });
    });
    it('should resolve using default delay if not specified', function () {
        var now = Date.now();
        return aplus.delay().then(function () {
            (Date.now() - now).should.be.at.least(100);
        });
    });
    it('should resolve using default delay when no parameters specified', function () {
        var now = Date.now();
        return aplus.delay().then(function () {
            (Date.now() - now).should.be.at.least(100);
        });
    });
    it('should resolve to `undefined` when no parameters specified', function () {
        return aplus.delay().then(function (value) {
            chai.expect(value).to.equal(undefined);
        });
    });
    it('should resolve using default delay when only value specified', function () {
        var now = Date.now();
        return aplus.delay('hi!').then(function () {
            (Date.now() - now).should.be.at.least(100);
        });
    });
    it('should resolve to value when only value specified', function () {
        return aplus.delay('hi!').then(function (value) {
            value.should.equal('hi!');
        });
    });
    it('should resolve using provided delay when delay and value specified', function () {
        var now = Date.now();
        return aplus.delay(200, 'bye!').then(function () {
            (Date.now() - now).should.be.at.least(200);
        });
    });
    it('should resolve to value when delay and value specified', function () {
        return aplus.delay(50, 'bye').then(function (value) {
            value.should.equal('bye');
        });
    });
    it('should throw exception when non number provided as delay and value is specified', function () {
        function test() {
            return aplus.delay('five seconds', 'hi!');
        }
        chai.expect(test).to.throw(TypeError);
    });
    it('should throw expected message for invalid delay', function () {
        function test() {
            return aplus.delay('five seconds', 'hi!');
        }
        chai.expect(test).to.throw('parameter ms must be a number, string was provided instead');
    });
});
