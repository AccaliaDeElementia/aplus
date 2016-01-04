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
describe('async.concat()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via async.each', function () {
        return async.concat([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.each.called.should.equal(true);
        });
    });
    it('should concatenate bare values', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [9, 8, 7, 6, 5];
        return async.concat(input, function (i) {
            return Promise.resolve(10 - i);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should concatenate single value arrays', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [9, 8, 7, 6, 5];
        return async.concat(input, function (i) {
            return Promise.resolve([10 - i]);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should concatenate multi value arrays', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 9, 2, 8, 3, 7, 4, 6, 5, 5];
        return async.concat(input, function (i) {
            return Promise.resolve([i, 10 - i]);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
});
describe('async.concatSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via async.eachSeries', function () {
        return async.concatSeries([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.eachSeries.called.should.equal(true);
        });
    });
    it('should concatenate bare values', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [9, 8, 7, 6, 5];
        return async.concatSeries(input, function (i) {
            return Promise.resolve(10 - i);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should concatenate single value arrays', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [9, 8, 7, 6, 5];
        return async.concatSeries(input, function (i) {
            return Promise.resolve([10 - i]);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should concatenate multi value arrays', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 9, 2, 8, 3, 7, 4, 6, 5, 5];
        return async.concatSeries(input, function (i) {
            return Promise.resolve([i, 10 - i]);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should not spawn additional promises once a promise rejects', function () {
        var promises = 0,
            error = new Error('early break');
        return async.concatSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            promises += 1;
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(false);
        }).catch(function () {
            promises.should.equal(5);
        });
    });
});
describe('async.concatLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via async.eachLimit', function () {
        return async.concatLimit([1], 3, function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.eachLimit.called.should.equal(true);
        });
    });
    it('should concatenate bare values', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [9, 8, 7, 6, 5];
        return async.concatLimit(input, 3, function (i) {
            return Promise.resolve(10 - i);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should concatenate single value arrays', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [9, 8, 7, 6, 5];
        return async.concatLimit(input, 3, function (i) {
            return Promise.resolve([10 - i]);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should concatenate multi value arrays', function () {
        var input = [1, 2, 3, 4, 5],
            expected = [1, 9, 2, 8, 3, 7, 4, 6, 5, 5];
        return async.concatLimit(input, 3, function (i) {
            return Promise.resolve([i, 10 - i]);
        }).then(function (values) {
            values.should.eql(expected);
        });
    });
    it('should not spawn additional promises once a promise rejects', function () {
        var input = [],
            promises = 0,
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input[i] = i;
        }
        return async.concatLimit(input, 3, function (j) {
            promises += 1;
            if (j === 5) {
                return Promise.reject(new Error());
            }
            return Promise.resolve(false);
        }).catch(function () {
            promises.should.be.lessThan(input.length);
        });
    });
});
