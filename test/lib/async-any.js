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

describe('async.any()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.some to async.any', function () {
        async.some.should.equal(async.any);
    });
    it('should spawn Promises via async.each', function () {
        return async.any([1], function () {
            return Promise.resolve(true);
        }).then(function () {
            async.each.called.should.equal(true);
        });
    });
    it('should resolve true when any promises resolve truthy', function () {
        return async.any([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            return Promise.resolve(i === 5);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should resolve false when all promises resolve falsey', function () {
        return async.any([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function () {
            return Promise.resolve(false);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return async.any([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(false);
        }).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
});
describe('async.anySeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.someSeries to async.anySeries', function () {
        async.someSeries.should.equal(async.anySeries);
    });
    it('should spawn Promises via async.eachSeries', function () {
        return async.anySeries([1], function () {
            return Promise.resolve(true);
        }).then(function () {
            async.eachSeries.called.should.equal(true);
        });
    });
    it('should resolve true when any promises resolve truthy', function () {
        return async.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            return Promise.resolve(i === 5);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should not spawn additional promises after a promise resolves truthy', function () {
        var promises = 0;
        return async.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            promises += 1;
            return Promise.resolve(i === 5);
        }).then(function () {
            promises.should.equal(5);
        });
    });
    it('should resolve false when all promises resolve falsey', function () {
        return async.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function () {
            return Promise.resolve(false);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return async.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(false);
        }).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should not spawn additional promises once a promise rejects', function () {
        var promises = 0,
            error = new Error('early break');
        return async.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
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
describe('async.anyLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.someLimit to async.anyLimit', function () {
        async.someLimit.should.equal(async.anyLimit);
    });
    it('should spawn Promises via async.eachLimit', function () {
        return async.anyLimit([1], 3, function () {
            return Promise.resolve(true);
        }).then(function () {
            async.eachLimit.called.should.equal(true);
        });
    });
    it('should resolve true when any promises resolve truthy', function () {
        return async.anyLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
            return Promise.resolve(i === 5);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should not spawn additional promises after a promise resolves truthy', function () {
        var input = [],
            promises = 0,
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input[i] = i;
        }
        return async.anyLimit(input, 3, function (j) {
            promises += 1;
            return Promise.resolve(j === 5);
        }).then(function () {
            promises.should.be.lessThan(input.length);
        });
    });
    it('should resolve false when all promises resolve falsey', function () {
        return async.anyLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function () {
            return Promise.resolve(false);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return async.anyLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(false);
        }).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should not spawn additional promises once a promise rejects', function () {
        var promises = 0,
            error = new Error('early break');
        return async.anyLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
            promises += 1;
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(false);
        }).catch(function () {
            promises.should.be.lessThan(10);
        });
    });
});
