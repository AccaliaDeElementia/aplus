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

describe('aplus.all()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.every to aplus.all', function () {
        aplus.every.should.equal(aplus.all);
    });
    it('should spawn Promises via aplus.each', function () {
        return aplus.all([1], function () {
            return Promise.resolve(true);
        }).then(function () {
            aplus.each.called.should.equal(true);
        });
    });
    it('should resolve true when all promises resolve truthy', function () {
        return aplus.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function () {
            return Promise.resolve(true);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should resolve false when any promises resolve falsey', function () {
        return aplus.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            return Promise.resolve(i !== 5);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return aplus.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
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
describe('aplus.allSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.everySeries to aplus.allSeries', function () {
        aplus.everySeries.should.equal(aplus.allSeries);
    });
    it('should spawn Promises via aplus.eachSeries', function () {
        return aplus.allSeries([1], function () {
            return Promise.resolve(true);
        }).then(function () {
            aplus.eachSeries.called.should.equal(true);
        });
    });
    it('should resolve true when all promises resolve truthy', function () {
        return aplus.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function () {
            return Promise.resolve(true);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should resolve false when any promises resolve falsey', function () {
        return aplus.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            return Promise.resolve(i !== 5);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should not spawn further Promises after a promise resolves falsey', function () {
        var spawned = 0;
        return aplus.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            spawned += 1;
            return Promise.resolve(i !== 5);
        }).then(function () {
            spawned.should.equal(5);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return aplus.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
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
        return aplus.allSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
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

describe('aplus.allLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.everyLimit to aplus.allLimit', function () {
        aplus.everySeries.should.equal(aplus.allSeries);
    });
    it('should spawn Promises via aplus.eachLimit', function () {
        return aplus.allLimit([1], 3, function () {
            return Promise.resolve(true);
        }).then(function () {
            aplus.eachLimit.called.should.equal(true);
        });
    });
    it('should resolve true when all promises resolve truthy', function () {
        return aplus.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function () {
            return Promise.resolve(true);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should resolve false when any promises resolve falsey', function () {
        return aplus.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
            return Promise.resolve(i !== 5);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should not spawn further Promises after a promise resolves falsey', function () {
        var spawned = 0;
        return aplus.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
            spawned += 1;
            return Promise.resolve(i !== 5);
        }).then(function () {
            spawned.should.be.lessThan(10);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return aplus.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
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
        return aplus.allLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
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
