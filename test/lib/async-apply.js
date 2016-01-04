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

describe('async.apply()', function () {
    it('should return a function', function () {
        async.apply(sinon.spy()).should.be.a('function');
    });
    it('should call wrapped function on execution', function () {
        var spy = sinon.spy(),
            wrapped = async.apply(spy);
        return wrapped().then(function () {
            spy.called.should.equal(true);
        });
    });
    it('should apply wrapped arguments to wrapped function', function () {
        var spy = sinon.spy(),
            wrapped = async.apply(spy, 4, 3, 5, 1, 2),
            expected = [4, 3, 5, 1, 2];
        return wrapped().then(function () {
            spy.firstCall.args.should.eql(expected);
        });
    });
    it('should apply passed arguments to wrapped function', function () {
        var spy = sinon.spy(),
            wrapped = async.apply(spy, 4, 3, 5, 1, 2),
            expected = [4, 3, 5, 1, 2, 9, 6, 8, 10, 7];
        return wrapped(9, 6, 8, 10, 7).then(function () {
            spy.firstCall.args.should.eql(expected);
        });
    });
    it('should resolve to value of inner promise', function () {
        var spy = sinon.stub(),
            wrapped = async.apply(spy),
            expected = 'i am a value';
        spy.returns(Promise.resolve('i am a value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept synchronous function', function () {
        var spy = sinon.stub(),
            wrapped = async.apply(spy),
            expected = 'i am a value';
        spy.returns('i am a value');
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept thenable function', function () {
        var spy = sinon.stub(),
            wrapped = async.apply(spy),
            expected = 'i am a value';
        spy.returns({
            then: function (r) {
                r('i am a value');
            }
        });
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should reject when inner promise rejects', function () {
        var spy = sinon.stub(),
            wrapped = async.apply(spy),
            expected = new Error('bad!');
        spy.returns(Promise.reject(expected));
        return wrapped().then(function () {
            chai.assert.fail('should not accept failing promise');
        }).catch(function (err) {
            err.should.equal(expected);
        });
    });
});
describe('async.applyEach()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should return a function', function () {
        async.applyEach(sinon.spy()).should.be.a('function');
    });
    it('should spawn promises via async.each', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEach([spy]);
        return wrapped().then(function () {
            async.each.called.should.equal(true);
        });
    });
    it('should call wrapped function on execution', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEach([spy]);
        return wrapped().then(function () {
            spy.called.should.equal(true);
        });
    });
    it('should applyEach wrapped arguments to wrapped function', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEach([spy], 4, 3, 5, 1, 2),
            expected = [4, 3, 5, 1, 2];
        return wrapped().then(function () {
            spy.firstCall.args.should.eql(expected);
        });
    });
    it('should applyEach passed arguments to wrapped function', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEach([spy], 4, 3, 5, 1, 2),
            expected = [4, 3, 5, 1, 2, 9, 6, 8, 10, 7];
        return wrapped(9, 6, 8, 10, 7).then(function () {
            spy.firstCall.args.should.eql(expected);
        });
    });
    it('should resolve to value of inner promise', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEach([spy]),
            expected = ['i am a value'];
        spy.returns(Promise.resolve('i am a value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve to value of inner promises', function () {
        var spy = sinon.stub(),
            spy2 = sinon.stub(),
            wrapped = async.applyEach([spy, spy2]),
            expected = ['i am a value', 'other value'];
        spy.returns(Promise.resolve('i am a value'));
        spy2.returns(Promise.resolve('other value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should work with object of functions too', function () {
        var spy = sinon.stub(),
            spy2 = sinon.stub(),
            wrapped = async.applyEach({
                one: spy,
                two: spy2
            }),
            expected = {
                one: 'i am a value',
                two: 'other value'
            };
        spy.returns(Promise.resolve('i am a value'));
        spy2.returns(Promise.resolve('other value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept synchronous function', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEach([spy]),
            expected = ['i am a value'];
        spy.returns('i am a value');
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept thenable function', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEach([spy]),
            expected = ['i am a value'];
        spy.returns({
            then: function (r) {
                r('i am a value');
            }
        });
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should reject when inner promise rejects', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEach([spy]),
            expected = new Error('bad!');
        spy.returns(Promise.reject(expected));
        return wrapped().then(function () {
            chai.assert.fail('should not accept failing promise');
        }).catch(function (err) {
            err.should.equal(expected);
        });
    });
});
describe('async.applyEachSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should return a function', function () {
        async.applyEachSeries(sinon.spy()).should.be.a('function');
    });
    it('should spawn promises via async.each', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEachSeries([spy]);
        return wrapped().then(function () {
            async.eachSeries.called.should.equal(true);
        });
    });
    it('should call wrapped function on execution', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEachSeries([spy]);
        return wrapped().then(function () {
            spy.called.should.equal(true);
        });
    });
    it('should applyEachSeries wrapped arguments to wrapped function', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEachSeries([spy], 4, 3, 5, 1, 2),
            expected = [4, 3, 5, 1, 2];
        return wrapped().then(function () {
            spy.firstCall.args.should.eql(expected);
        });
    });
    it('should applyEachSeries passed arguments to wrapped function', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEachSeries([spy], 4, 3, 5, 1, 2),
            expected = [4, 3, 5, 1, 2, 9, 6, 8, 10, 7];
        return wrapped(9, 6, 8, 10, 7).then(function () {
            spy.firstCall.args.should.eql(expected);
        });
    });
    it('should resolve to value of inner promise', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEachSeries([spy]),
            expected = ['i am a value'];
        spy.returns(Promise.resolve('i am a value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve to value of inner promises', function () {
        var spy = sinon.stub(),
            spy2 = sinon.stub(),
            wrapped = async.applyEachSeries([spy, spy2]),
            expected = ['i am a value', 'other value'];
        spy.returns(Promise.resolve('i am a value'));
        spy2.returns(Promise.resolve('other value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should work with object of functions too', function () {
        var spy = sinon.stub(),
            spy2 = sinon.stub(),
            wrapped = async.applyEachSeries({
                one: spy,
                two: spy2
            }),
            expected = {
                one: 'i am a value',
                two: 'other value'
            };
        spy.returns(Promise.resolve('i am a value'));
        spy2.returns(Promise.resolve('other value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept synchronous function', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEachSeries([spy]),
            expected = ['i am a value'];
        spy.returns('i am a value');
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept thenable function', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEachSeries([spy]),
            expected = ['i am a value'];
        spy.returns({
            then: function (r) {
                r('i am a value');
            }
        });
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should reject when inner promise rejects', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEachSeries([spy]),
            expected = new Error('bad!');
        spy.returns(Promise.reject(expected));
        return wrapped().then(function () {
            chai.assert.fail('should not accept failing promise');
        }).catch(function (err) {
            err.should.equal(expected);
        });
    });
});
describe('async.applyEachLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should return a function', function () {
        async.applyEachLimit(sinon.spy(), 2).should.be.a('function');
    });
    it('should spawn promises via async.each', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEachLimit([spy], 3);
        return wrapped().then(function () {
            async.eachLimit.called.should.equal(true);
        });
    });
    it('should call wrapped function on execution', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEachLimit([spy], 3);
        return wrapped().then(function () {
            spy.called.should.equal(true);
        });
    });
    it('should applyEachLimit wrapped arguments to wrapped function', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEachLimit([spy], 3, 4, 3, 5, 1, 2),
            expected = [4, 3, 5, 1, 2];
        return wrapped().then(function () {
            spy.firstCall.args.should.eql(expected);
        });
    });
    it('should applyEachLimit passed arguments to wrapped function', function () {
        var spy = sinon.spy(),
            wrapped = async.applyEachLimit([spy], 3, 4, 3, 5, 1, 2),
            expected = [4, 3, 5, 1, 2, 9, 6, 8, 10, 7];
        return wrapped(9, 6, 8, 10, 7).then(function () {
            spy.firstCall.args.should.eql(expected);
        });
    });
    it('should resolve to value of inner promise', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEachLimit([spy], 3),
            expected = ['i am a value'];
        spy.returns(Promise.resolve('i am a value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve to value of inner promises', function () {
        var spy = sinon.stub(),
            spy2 = sinon.stub(),
            wrapped = async.applyEachLimit([spy, spy2], 3),
            expected = ['i am a value', 'other value'];
        spy.returns(Promise.resolve('i am a value'));
        spy2.returns(Promise.resolve('other value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should work with object of functions too', function () {
        var spy = sinon.stub(),
            spy2 = sinon.stub(),
            wrapped = async.applyEachLimit({
                one: spy,
                two: spy2
            }, 3),
            expected = {
                one: 'i am a value',
                two: 'other value'
            };
        spy.returns(Promise.resolve('i am a value'));
        spy2.returns(Promise.resolve('other value'));
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept synchronous function', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEachLimit([spy], 3),
            expected = ['i am a value'];
        spy.returns('i am a value');
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept thenable function', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEachLimit([spy], 3),
            expected = ['i am a value'];
        spy.returns({
            then: function (r) {
                r('i am a value');
            }
        });
        return wrapped().then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should reject when inner promise rejects', function () {
        var spy = sinon.stub(),
            wrapped = async.applyEachLimit([spy], 3),
            expected = new Error('bad!');
        spy.returns(Promise.reject(expected));
        return wrapped().then(function () {
            chai.assert.fail('should not accept failing promise');
        }).catch(function (err) {
            err.should.equal(expected);
        });
    });
});
