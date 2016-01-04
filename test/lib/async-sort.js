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
describe('async.sort()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.sortBy to async.sort', function () {
        async.sortBy.should.equal(async.sort);
    });
    it('should spawn Promises via async.each', function () {
        return async.sort([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.each.called.should.equal(true);
        });
    });
    it('should accept empty input', function () {
        return async.sort([], function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should accept null input', function () {
        return async.sort(null, function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should sort input', function () {
        var input = [8, 2, 5, 1, 0, 4, 3, 9, 7, 6, 5],
            expected = [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
        return async.sort(input, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should sort large input', function () {
        var input = [],
            expected;
        for (var i = 0; i < 100; i += 1) {
            input.push(Math.random());
        }
        expected = input.slice();
        expected.sort(function (a, b) {
            return a - b;
        });
        return async.sort(input, function (j) {
            return Promise.resolve(j);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
});
describe('async.sortSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.sortBySeries to async.sortSeries', function () {
        async.sortBySeries.should.equal(async.sortSeries);
    });
    it('should spawn Promises via async.eachSeries', function () {
        return async.sortSeries([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.eachSeries.called.should.equal(true);
        });
    });
    it('should accept empty input', function () {
        return async.sortSeries([], function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should accept null input', function () {
        return async.sortSeries(null, function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should sort input', function () {
        var input = [8, 2, 5, 1, 0, 4, 3, 9, 7, 6, 5],
            expected = [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
        return async.sortSeries(input, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should sort large input', function () {
        var input = [],
            expected;
        for (var i = 0; i < 100; i += 1) {
            input.push(Math.random());
        }
        expected = input.slice();
        expected.sort(function (a, b) {
            return a - b;
        });
        return async.sortSeries(input, function (j) {
            return Promise.resolve(j);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should not spawn additional promises once a promise rejects', function () {
        var promises = 0,
            error = new Error('early break');
        return async.sortSeries([8, 2, 5, 1, 0, 4, 3, 9, 7, 6], function (i) {
            promises += 1;
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(false);
        }).then(function () {
            chai.assert.fail('Should Not Accept Promise');
        }).catch(function () {
            promises.should.equal(3);
        });
    });
});
describe('async.sortLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.sortByLimit to async.sortLimit', function () {
        async.sortByLimit.should.equal(async.sortLimit);
    });
    it('should spawn Promises via async.eachLimit', function () {
        return async.sortLimit([1], 3, function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.eachLimit.called.should.equal(true);
        });
    });
    it('should accept empty input', function () {
        return async.sortLimit([], 3, function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should accept null input', function () {
        return async.sortLimit(null, 3, function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should sort input', function () {
        var input = [8, 2, 5, 1, 0, 4, 3, 9, 7, 6, 5],
            expected = [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
        return async.sortLimit(input, 3, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should sort large input', function () {
        var input = [],
            expected;
        for (var i = 0; i < 100; i += 1) {
            input.push(Math.random());
        }
        expected = input.slice();
        expected.sort(function (a, b) {
            return a - b;
        });
        return async.sortLimit(input, 3, function (j) {
            return Promise.resolve(j);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should not spawn additional promises once a promise rejects', function () {
        var promises = 0,
            error = new Error('early break');
        return async.sortLimit([8, 2, 5, 1, 0, 4, 3, 9, 7, 6], function (i) {
            promises += 1;
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(false);
        }).then(function () {
            chai.assert.fail('Should Not Accept Promise');
        }).catch(function () {
            promises.should.be.lessThan(10);
        });
    });
});
