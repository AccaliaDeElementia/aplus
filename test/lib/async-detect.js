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

describe('aplus.detect()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via aplus.each', function () {
        return aplus.detect([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            aplus.each.called.should.equal(true);
        });
    });
    it('should detect value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = 5;
        return aplus.detect(input, function (i) {
            return Promise.resolve(i === expected);
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve as undefined when value not detected', function () {
        var input = [1, 2, 3, 4, 5];
        return aplus.detect(input, function (i) {
            return Promise.resolve(i === 90);
        }).then(function (value) {
            chai.expect(value).to.eql(undefined);
        });
    });
    it('should reject when inner promise rejects', function () {
        var input = [1, 2, 3, 4, 5],
            error = new Error('BAD SCARY ERROR');
        return aplus.detect(input, function (i) {
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
describe('aplus.detectSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via aplus.eachSeries', function () {
        return aplus.detectSeries([1], function (i) {
            return Promise.resolve(i);
        }).then(function () {
            aplus.eachSeries.called.should.equal(true);
        });
    });
    it('should detect value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = 5;
        return aplus.detectSeries(input, function (i) {
            return Promise.resolve(i === expected);
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve as undefined when value not detected', function () {
        var input = [1, 2, 3, 4, 5];
        return aplus.detectSeries(input, function (i) {
            return Promise.resolve(i === 90);
        }).then(function (value) {
            chai.expect(value).to.eql(undefined);
        });
    });
    it('should stop spawning promises after detecting value', function () {
        var input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            spawned = 0;
        return aplus.detectSeries(input, function (i) {
            spawned += 1;
            return Promise.resolve(i === 4);
        }).then(function () {
            spawned.should.eql(4);
        });
    });
    it('should reject when inner promise rejects', function () {
        var input = [1, 2, 3, 4, 5],
            error = new Error('BAD SCARY ERROR');
        return aplus.detectSeries(input, function (i) {
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
        return aplus.detectSeries(input, function (i) {
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
describe('aplus.detectLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn Promises via aplus.eachLimit', function () {
        return aplus.detectLimit([1], 5, function (i) {
            return Promise.resolve(i);
        }).then(function () {
            aplus.eachLimit.called.should.equal(true);
        });
    });
    it('should detect value', function () {
        var input = [1, 2, 3, 4, 5],
            expected = 5;
        return aplus.detectLimit(input, 3, function (i) {
            return Promise.resolve(i === expected);
        }).then(function (value) {
            value.should.eql(expected);
        });
    });
    it('should resolve as undefined when value not detected', function () {
        var input = [1, 2, 3, 4, 5];
        return aplus.detectLimit(input, 3, function (i) {
            return Promise.resolve(i === 90);
        }).then(function (value) {
            chai.expect(value).to.eql(undefined);
        });
    });
    it('should stop spawning promises after detecting value', function () {
        var input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            spawned = 0;
        return aplus.detectLimit(input, 3, function (i) {
            spawned += 1;
            return Promise.resolve(i === 4);
        }).then(function () {
            spawned.should.be.lessThan(input.length);
        });
    });
    it('should reject when inner promise rejects', function () {
        var input = [1, 2, 3, 4, 5],
            error = new Error('BAD SCARY ERROR');
        return aplus.detectLimit(input, 3, function (i) {
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
        return aplus.detectLimit(input, 3, function (i) {
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
