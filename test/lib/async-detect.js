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

describe('async.detect()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via async.each', function () {
        return async.detect([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.each.called.should.equal(true);
        });
    });
    it('should detect value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = 5;
        return async.detect(input, function (i) {
            return Promise.resolve(i === expected);
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve as undefined when value not detected', function () {
        var input = [1, 2, 3, 4, 5];
        return async.detect(input, function (i) {
            return Promise.resolve(i === 90);
        }).then(function (value) {
            chai.expect(value).to.eql(undefined);
        });
    });
    it('should reject when inner promise rejects', function () {
        var input = [1, 2, 3, 4, 5],
            error = new Error('BAD SCARY ERROR');
        return async.detect(input, function (i) {
            if (i === 3) {
                throw error;
            }
            return Promise.resolve(false);
        }).then(function () {
            chai.assert.fail('should not accept!');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
});
describe('async.detectSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via async.eachSeries', function () {
        return async.detectSeries([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.eachSeries.called.should.equal(true);
        });
    });
    it('should detect value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = 5;
        return async.detectSeries(input, function (i) {
            return Promise.resolve(i === expected);
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve as undefined when value not detected', function () {
        var input = [1, 2, 3, 4, 5];
        return async.detectSeries(input, function (i) {
            return Promise.resolve(i === 90);
        }).then(function (value) {
            chai.expect(value).to.eql(undefined);
        });
    });
    it('should stop spawning promises after detecting value', function () {
        var input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            spawned = 0;
        return async.detectSeries(input, function (i) {
            spawned += 1;
            return Promise.resolve(i === 4);
        }).then(function () {
            spawned.should.eql(4);
        });
    });
    it('should reject when inner promise rejects', function () {
        var input = [1, 2, 3, 4, 5],
            error = new Error('BAD SCARY ERROR');
        return async.detectSeries(input, function (i) {
            if (i === 3) {
                throw error;
            }
            return Promise.resolve(false);
        }).then(function () {
            chai.assert.fail('should not accept!');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should stop spawning promises after inner promise rejects', function () {
        var input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            spawned = 0;
        return async.detectSeries(input, function (i) {
            spawned += 1;
            if (i === 4) {
                throw new Error('break');
            }
            return Promise.resolve(false);
        }).catch(function () {
            spawned.should.eql(4);
        });
    });
});
describe('async.detectLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via async.eachLimit', function () {
        return async.detectLimit([1], 5, function (i) {
            return Promise.resolve(i);
        }).then(function () {
            async.eachLimit.called.should.equal(true);
        });
    });
    it('should detect value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = 5;
        return async.detectLimit(input, 3, function (i) {
            return Promise.resolve(i === expected);
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve as undefined when value not detected', function () {
        var input = [1, 2, 3, 4, 5];
        return async.detectLimit(input, 3, function (i) {
            return Promise.resolve(i === 90);
        }).then(function (value) {
            chai.expect(value).to.eql(undefined);
        });
    });
    it('should stop spawning promises after detecting value', function () {
        var input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            spawned = 0;
        return async.detectLimit(input, 3, function (i) {
            spawned += 1;
            return Promise.resolve(i === 4);
        }).then(function () {
            spawned.should.be.lessThan(input.length);
        });
    });
    it('should reject when inner promise rejects', function () {
        var input = [1, 2, 3, 4, 5],
            error = new Error('BAD SCARY ERROR');
        return async.detectLimit(input, 3, function (i) {
            if (i === 3) {
                throw error;
            }
            return Promise.resolve(false);
        }).then(function () {
            chai.assert.fail('should not accept!');
        }).catch(function (err) {
            err.should.equal(error);
        });
    });
    it('should stop spawning promises after inner promise rejects', function () {
        var input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            spawned = 0;
        return async.detectLimit(input, 3, function (i) {
            spawned += 1;
            if (i === 4) {
                throw new Error('break');
            }
            return Promise.resolve(false);
        }).catch(function () {
            spawned.should.be.lessThan(input.length);
        });
    });
});
