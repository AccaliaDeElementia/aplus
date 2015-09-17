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

describe('aplus.any()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.some to aplus.any', function () {
        aplus.some.should.equal(aplus.any);
    });
    it('should spawn Promises via aplus.each', function () {
        return aplus.any([1], function () {
            return Promise.resolve(true);
        }).then(function () {
            aplus.each.called.should.equal(true);
        });
    });
    it('should resolve true when any promises resolve truthy', function () {
        return aplus.any([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            return Promise.resolve(i === 5);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should resolve false when all promises resolve falsey', function () {
        return aplus.any([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function () {
            return Promise.resolve(false);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return aplus.any([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
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
describe('aplus.anySeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.someSeries to aplus.anySeries', function () {
        aplus.someSeries.should.equal(aplus.anySeries);
    });
    it('should spawn Promises via aplus.eachSeries', function () {
        return aplus.anySeries([1], function () {
            return Promise.resolve(true);
        }).then(function () {
            aplus.eachSeries.called.should.equal(true);
        });
    });
    it('should resolve true when any promises resolve truthy', function () {
        return aplus.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            return Promise.resolve(i === 5);
        }).then(function (value) {
            value.should.equal(true);
        });
    });
    it('should not spawn additional promises after a promise resolves truthy', function () {
        var promises = 0;
        return aplus.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
            promises += 1;
            return Promise.resolve(i === 5);
        }).then(function () {
            promises.should.equal(5);
        });
    });
    it('should resolve false when all promises resolve falsey', function () {
        return aplus.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function () {
            return Promise.resolve(false);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return aplus.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
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
        return aplus.anySeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (i) {
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
describe('aplus.anyLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should alias aplus.someLimit to aplus.anyLimit', function () {
        aplus.someLimit.should.equal(aplus.anyLimit);
    });
    it('should spawn Promises via aplus.eachLimit', function () {
        return aplus.anyLimit([1], 3, function () {
            return Promise.resolve(true);
        }).then(function () {
            aplus.eachLimit.called.should.equal(true);
        });
    });
    it('should resolve true when any promises resolve truthy', function () {
        return aplus.anyLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
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
        return aplus.anyLimit(input, 3, function (i) {
            promises += 1;
            return Promise.resolve(i === 5);
        }).then(function () {
            promises.should.be.lessThan(input.length);
        });
    });
    it('should resolve false when all promises resolve falsey', function () {
        return aplus.anyLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function () {
            return Promise.resolve(false);
        }).then(function (value) {
            value.should.equal(false);
        });
    });
    it('should reject if any promises reject', function () {
        var error = new Error('early break');
        return aplus.anyLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
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
        return aplus.anyLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, function (i) {
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
