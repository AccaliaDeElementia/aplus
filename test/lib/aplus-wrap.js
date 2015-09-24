'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    sinon = require('sinon');

if (!global.Promise) {
    global.Promise = require('promise-polyfill');
}
Promise.delay = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};
chai.use(chaiAsPromised);
chai.should();

var aplus = require('../../lib/aplus');
describe('aplus.wrap()', function () {
    it('should alias aplus.promisify() as aplus.wrap()', function () {
        aplus.promisify.should.equal(aplus.wrap);
    });
    it('should throw TypeError on wrapping non function property', function () {
        function test() {
            return aplus.wrap({}, 'a');
        }
        chai.expect(test).to.throw(TypeError);
    });
    it('should throw expected message on wrapping non function property', function () {
        function test() {
            return aplus.wrap({}, 'a');
        }
        chai.expect(test).to.throw('Attempted to wrap undefined property a as function');
    });
    it('should throw TypeError on wrapping non function', function () {
        function test() {
            return aplus.wrap({});
        }
        chai.expect(test).to.throw(TypeError);
    });
    it('should throw expected message on wrapping non function property', function () {
        function test() {
            return aplus.wrap('a');
        }
        chai.expect(test).to.throw('Attempted to wrap string value as function');
    });
    it('should wrap and return function', function () {
        aplus.wrap(sinon.spy()).should.be.a('function');
    });
    it('should wrap and return property', function () {
        var o = {
            spy: sinon.spy()
        };
        aplus.wrap(o, 'spy').should.be.a('function');
    });
    it('wrapped function should return promise', function () {
        aplus.wrap(sinon.spy())().should.be.an.instanceOf(Promise);
    });

    it('wrapped property should return promise', function () {
        var o = {
            spy: sinon.spy()
        };
        aplus.wrap(o, 'spy')().should.be.an.instanceOf(Promise);
    });
    it('should bind thisValue for wrapped proeprty', function () {
        var o = {
            spy: sinon.spy()
        };
        aplus.wrap(o, 'spy')();
        o.spy.firstCall.thisValue.should.equal(o);
    });
    it('should reject when wrapped value throws exception', function () {
        var spy = sinon.stub(),
            wrapped = aplus.wrap(spy),
            error = new Error('friends?');
        spy.throws(error);
        return wrapped().then(function () {
            chai.assert.fail('should not accept!');
        }, function (err) {
            err.should.equal(error);
        });
    });
    it('should reject when wrapped value yields error', function () {
        var spy = sinon.stub(),
            wrapped = aplus.wrap(spy),
            error = new Error('friends?');
        spy.yields(error);
        return wrapped().then(function () {
            chai.assert.fail('should not accept!');
        }, function (err) {
            err.should.equal(error);
        });
    });
    it('should resolve to single value when wrapped function yields no values', function () {
        var spy = sinon.stub(),
            wrapped = aplus.wrap(spy);
        spy.yields(null);
        return wrapped().then(function (result) {
            chai.expect(result).to.equal(undefined);
        });
    });
    it('should resolve to single value when wrapped function yields single value', function () {
        var spy = sinon.stub(),
            wrapped = aplus.wrap(spy),
            value = Math.random();
        spy.yields(null, value);
        return wrapped().then(function (result) {
            result.should.equal(value);
        });
    });
    it('should resolve to value array when wrapped function yields multiple value', function () {
        var spy = sinon.stub(),
            wrapped = aplus.wrap(spy),
            value = Math.random(),
            other = Math.random();
        spy.yields(null, value, other);
        return wrapped().then(function (result) {
            result.should.eql([value, other]);
        });
    });
});
