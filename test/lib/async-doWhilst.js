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


describe('async.doWhilst()', function () {
    it('should alias async.doDuring to async.doWhilst', function () {
        async.doDuring.should.equal(async.doWhilst);
    });
    it('should call iterator on initial test failure', function () {
        var test = sinon.stub(),
            iterator = sinon.stub();
        test.returns(Promise.resolve(false));
        iterator.returns(Promise.resolve());
        return async.doWhilst(iterator, test).then(function () {
            iterator.called.should.equal(true);
        });
    });
    it('should abort loop on test rejection', function () {
        var error = new Error('foobar'),
            test = sinon.stub(),
            iterator = sinon.stub();
        iterator.returns(Promise.resolve());
        test.returns(Promise.reject(error));
        return async.doWhilst(iterator, test).then(function () {
            chai.assert.fail('should not accept promise!');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should abort loop on test exception', function () {
        var error = new Error('foobar'),
            test = sinon.stub(),
            iterator = sinon.stub();
        test.throws(error);
        iterator.returns(Promise.resolve());
        return async.doWhilst(iterator, test).then(function () {
            chai.assert.fail('should not accept promise!');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should terminate loop when test resolves falsy', function () {
        var test = sinon.stub(),
            iterator = sinon.stub();
        test.returns(Promise.resolve(true));
        test.onCall(5).returns(Promise.resolve(false));
        iterator.returns(Promise.resolve(null));
        return async.doWhilst(iterator, test).then(function () {
            // will operate an extra time due to the post check
            iterator.callCount.should.equal(6);
        });
    });
    it('should resolve loop with undefined value', function () {
        var test = sinon.stub(),
            iterator = sinon.stub();
        test.returns(Promise.resolve(true));
        test.onCall(5).returns(Promise.resolve(false));
        iterator.returns(Promise.resolve(null));
        return async.doWhilst(iterator, test).then(function (value) {
            chai.expect(value).to.equal(undefined);
        });
    });
    it('should abort loop on iterator rejection', function () {
        var error = new Error('foobar'),
            test = sinon.stub(),
            iterator = sinon.stub();
        test.returns(Promise.resolve(true));
        iterator.returns(Promise.reject(error));
        return async.doWhilst(iterator, test).then(function () {
            chai.assert.fail('should not accept promise!');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should abort loop on iterator exception', function () {
        var error = new Error('foobar'),
            test = sinon.stub(),
            iterator = sinon.stub();
        test.returns(Promise.resolve(true));
        iterator.throws(error);
        return async.doWhilst(iterator, test).then(function () {
            chai.assert.fail('should not accept promise!');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should tolerate synchronous test function', function () {
        var test = sinon.stub(),
            iterator = sinon.stub();
        test.returns(true);
        test.onCall(5).returns(false);
        iterator.returns(Promise.resolve(null));
        return async.doWhilst(iterator, test).then(function (value) {
            chai.expect(value).to.equal(undefined);
        });
    });
    it('should tolerate synchronous iterator', function () {
        var test = sinon.stub(),
            iterator = sinon.stub();
        test.returns(Promise.resolve(true));
        test.onCall(5).returns(Promise.resolve(false));
        iterator.returns(null);
        return async.doWhilst(iterator, test).then(function (value) {
            chai.expect(value).to.equal(undefined);
        });
    });
    it('should tolerate thenable test function', function () {
        var test = sinon.stub(),
            iterator = sinon.stub();
        test.returns({
            then: function (resolve) {
                return resolve(true);
            }
        });
        test.onCall(5).returns({
            then: function (resolve) {
                return resolve(false);
            }
        });
        iterator.returns(Promise.resolve(null));
        return async.doWhilst(iterator, test).then(function (value) {
            chai.expect(value).to.equal(undefined);
        });
    });
    it('should tolerate thenable test function', function () {
        var test = sinon.stub(),
            iterator = sinon.stub();
        test.returns(Promise.resolve(true));
        test.onCall(5).returns(Promise.resolve(false));
        iterator.returns({
            test: function (resolve) {
                return resolve(null);
            }
        });
        return async.doWhilst(iterator, test).then(function (value) {
            chai.expect(value).to.equal(undefined);
        });
    });
});
