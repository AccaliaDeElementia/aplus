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

describe('aplus.foldl()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.reduce to aplus.foldl', function () {
        aplus.reduce.should.equal(aplus.foldl);
    });
    it('should spawn Promises via aplus.eachSeries', function () {
        return aplus.foldl([1], 0, function () {
            return Promise.resolve(true);
        }).then(function () {
            aplus.eachSeries.called.should.equal(true);
        });
    });
    it('should reduce in left to right order', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 2, 3, 4, 5],
            order = [];
        return aplus.foldl(input, 0, function (_, item) {
            order.push(item);
            return Promise.resolve(item);
        }).then(function () {
            order.should.eql(expected);
        });
    });
    it('should reduce to single value', function () {
        var input = [1, 2, 30, 4, 5],
            expected = 30;
        return aplus.foldl(input, 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept empty series as start value', function () {
        return aplus.foldl([], 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(0);
        });
    });
    it('should accept null series as start value', function () {
        return aplus.foldl(null, 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(0);
        });
    });
});
describe('aplus.foldr()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'foldl');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.reduceRight to aplus.foldr', function () {
        aplus.reduceRight.should.equal(aplus.foldr);
    });
    it('should pass processing off to aplus.foldl', function () {
        return aplus.foldr([1], 0, function () {
            return Promise.resolve(true);
        }).then(function () {
            aplus.foldl.called.should.equal(true);
        });
    });
    it('should reverse order before handing off to foldl', function () {
        var input = [5, 4, 3, 2, 1],
            expected = [1, 2, 3, 4, 5];
        return aplus.foldr(input, 0, function (_, item) {
            return Promise.resolve(item);
        }).then(function () {
            aplus.foldl.firstCall.args[0].should.eql(expected);
        });
    });
    it('should reduce to single value', function () {
        var input = [1, 2, 30, 4, 5],
            expected = 30;
        return aplus.foldr(input, 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should accept empty series as start value', function () {
        return aplus.foldr([], 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(0);
        });
    });
    it('should accept null series as start value', function () {
        return aplus.foldr(null, 0, function (a, b) {
            return Promise.resolve(Math.max(a, b));
        }).then(function (value) {
            value.should.eql(0);
        });
    });
});
