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

describe('async.all()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.every to async.all', function () {
        async.every.should.equal(async.all);
    });
    it('should spawn Promises via async.each', function () {
        return async.all([1], function () {
            return Promise.resolve(true);
        }).then(function () {
            async.each.called.should.equal(true);
        });
    });
    it('should resolve true when all promises resolve truthy', function () {
        return async.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function () {
            return Promise.resolve(true);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should resolve false when any promises resolve falsey', function () {
        return async.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            return Promise.resolve(i !== 5);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return async.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(true);
        }).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
});
describe('async.allSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.everySeries to async.allSeries', function () {
        async.everySeries.should.equal(async.allSeries);
    });
    it('should spawn Promises via async.eachSeries', function () {
        return async.allSeries([1], function () {
            return Promise.resolve(true);
        }).then(function () {
            async.eachSeries.called.should.equal(true);
        });
    });
    it('should resolve true when all promises resolve truthy', function () {
        return async.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function () {
            return Promise.resolve(true);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should resolve false when any promises resolve falsey', function () {
        return async.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            return Promise.resolve(i !== 5);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should not spawn further Promises after a promise resolves falsey', function () {
        var spawned = 0;
        return async.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            spawned += 1;
            return Promise.resolve(i !== 5);
        }).then(function () {
            spawned.should.equal(5);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return async.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(true);
        }).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should not spawn further Promises after a promise rejects', function () {
        var spawned = 0;
        return async.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            spawned += 1;
            if (i === 5) {
                throw new Error('hi there!');
            }
            return Promise.resolve(i !== 5);
        }).catch(function () {
            spawned.should.equal(5);
        });
    });
});

describe('async.allLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias async.everyLimit to async.allLimit', function () {
        async.everySeries.should.equal(async.allSeries);
    });
    it('should spawn Promises via async.eachLimit', function () {
        return async.allLimit([1], 3, function () {
            return Promise.resolve(true);
        }).then(function () {
            async.eachLimit.called.should.equal(true);
        });
    });
    it('should resolve true when all promises resolve truthy', function () {
        return async.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function () {
            return Promise.resolve(true);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should resolve false when any promises resolve falsey', function () {
        return async.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
            return Promise.resolve(i !== 5);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should not spawn further Promises after a promise resolves falsey', function () {
        var input = [],
            spawned = 0,
            length = 100;
        for (var i = 1; i <= length; i += 1) {
            input[i] = i;
        }
        return async.allLimit(input, 3, function (j) {
            spawned += 1;
            return Promise.resolve(j !== 5);
        }).then(function () {
            spawned.should.be.lessThan(input.length);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return async.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
            if (i === 5) {
                throw error;
            }
            return Promise.resolve(true);
        }).then(function () {
            chai.assert.fail('Should not accept promise');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should not spawn further Promises after a promise rejects', function () {
        var spawned = 0;
        return async.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
            spawned += 1;
            if (i === 5) {
                throw new Error('hi there!');
            }
            return Promise.resolve(i !== 5);
        }).catch(function () {
            spawned.should.be.lessThan(10);
        });
    });
});
