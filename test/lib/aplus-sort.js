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
describe('aplus.sort()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.sortBy to aplus.sort', function () {
        aplus.sortBy.should.equal(aplus.sort);
    });
    it('should spawn Promises via aplus.each', function () {
        return aplus.sort([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            aplus.each.called.should.equal(true);
        });
    });
    it('should accept empty input', function () {
        return aplus.sort([], function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should accept null input', function () {
        return aplus.sort(null, function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should sort input', function () {
        var input = [8, 2, 5, 1, 0, 4, 3, 9, 7, 6, 5],
            expected = [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
        return aplus.sort(input, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should sort large input', function () {
        var input = [],
            expected;
        for (var i = 0; i < 1000; i += 1) {
            input.push(Math.random());
        }
        expected = input.slice();
        expected.sort();
        return aplus.sort(input, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
});
describe('aplus.sortSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.sortBySeries to aplus.sortSeries', function () {
        aplus.sortBySeries.should.equal(aplus.sortSeries);
    });
    it('should spawn Promises via aplus.eachSeries', function () {
        return aplus.sortSeries([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            aplus.eachSeries.called.should.equal(true);
        });
    });
    it('should accept empty input', function () {
        return aplus.sortSeries([], function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should accept null input', function () {
        return aplus.sortSeries(null, function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should sort input', function () {
        var input = [8, 2, 5, 1, 0, 4, 3, 9, 7, 6, 5],
            expected = [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
        return aplus.sortSeries(input, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should sort large input', function () {
        var input = [],
            expected;
        for (var i = 0; i < 1000; i += 1) {
            input.push(Math.random());
        }
        expected = input.slice();
        expected.sort();
        return aplus.sortSeries(input, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should not spawn additional promises once a promise rejects', function () {
        var promises = 0,
            error = new Error('early break');
        return aplus.sortSeries([8, 2, 5, 1, 0, 4, 3, 9, 7, 6], function (i) {
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
describe('aplus.sortLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.sortByLimit to aplus.sortLimit', function () {
        aplus.sortByLimit.should.equal(aplus.sortLimit);
    });
    it('should spawn Promises via aplus.eachLimit', function () {
        return aplus.sortLimit([1], 3, function (i) {
            return Promise.resolve(i);
        }).then(function () {
            aplus.eachLimit.called.should.equal(true);
        });
    });
    it('should accept empty input', function () {
        return aplus.sortLimit([], 3, function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should accept null input', function () {
        return aplus.sortLimit(null, 3, function (i) {
            return Promise.resolve(i);
        }).then(function (value) {
            value.should.eql([]);
        });
    });
    it('should sort input', function () {
        var input = [8, 2, 5, 1, 0, 4, 3, 9, 7, 6, 5],
            expected = [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
        return aplus.sortLimit(input, 3, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should sort large input', function () {
        var input = [],
            expected;
        for (var i = 0; i < 1000; i += 1) {
            input.push(Math.random());
        }
        expected = input.slice();
        expected.sort();
        return aplus.sortLimit(input, 3, function (i) {
            return Promise.resolve(i);
        }).then(function (output) {
            output.should.eql(expected);
        });
    });
    it('should not spawn additional promises once a promise rejects', function () {
        var promises = 0,
            error = new Error('early break');
        return aplus.sortLimit([8, 2, 5, 1, 0, 4, 3, 9, 7, 6], function (i) {
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
