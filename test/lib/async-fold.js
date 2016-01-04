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

describe('async.foldl()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.reduce to async.foldl', function () {
        async.reduce.should.equal(async.foldl);
    });
    it('should spawn Promises via async.eachSeries', function () {
        return async.foldl([1], 0, function () {
            return Promise.resolve(true);
        }).then(function () {
            async.eachSeries.called.should.equal(true);
        });
    });
    it('should reduce in left to right order', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 2, 3, 4, 5],
            order = [];
        return async.foldl(input, 0, function (_, item) {
            order.push(item);
            return Promise.resolve(item);
        }).then(function () {
            order.should.eql(expected);
        });
    });
    it('should reduce to single value', function () {
        var input = [1, 2, 30, 4, 5],
            expected = 30;
        return async.foldl(input, 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept empty series as start value', function () {
        return async.foldl([], 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(0);
        });
    });
    it('should accept null series as start value', function () {
        return async.foldl(null, 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(0);
        });
    });
});
describe('async.foldr()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'foldl');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.reduceRight to async.foldr', function () {
        async.reduceRight.should.equal(async.foldr);
    });
    it('should pass processing off to async.foldl', function () {
        return async.foldr([1], 0, function () {
            return Promise.resolve(true);
        }).then(function () {
            async.foldl.called.should.equal(true);
        });
    });
    it('should reverse order before handing off to foldl', function () {
        var input = [5, 4, 3, 2, 1],
            expected = [1, 2, 3, 4, 5];
        return async.foldr(input, 0, function (_, item) {
            return Promise.resolve(item);
        }).then(function () {
            async.foldl.firstCall.args[0].should.eql(expected);
        });
    });
    it('should reduce to single value', function () {
        var input = [1, 2, 30, 4, 5],
            expected = 30;
        return async.foldr(input, 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept empty series as start value', function () {
        return async.foldr([], 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(0);
        });
    });
    it('should accept null series as start value', function () {
        return async.foldr(null, 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(0);
        });
    });
});
