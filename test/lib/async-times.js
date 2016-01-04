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

describe('async.times()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should proxy requests to async.each()', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.times(5, spy).then(function () {
            async.each.called.should.equal(true);
        });
    });
    it('should not loop for zero times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.times(0, spy).then(function () {
            async.each.called.should.equal(false);
        });
    });
    it('should not loop for negative times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.times(-1, spy).then(function () {
            async.each.called.should.equal(false);
        });
    });
    it('should not loop for null times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.times(null, spy).then(function () {
            async.each.called.should.equal(false);
        });
    });
    it('should not loop for NaN times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.times(Number.NaN, spy).then(function () {
            async.each.called.should.equal(false);
        });
    });
    it('should not loop for string times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.times('hi!', spy).then(function () {
            async.each.called.should.equal(false);
        });
    });
    it('should take floor for non integral times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.times(6.3, spy).then(function () {
            spy.callCount.should.equal(6);
        });
    });
    it('should execute requested number of times', function () {
        function square(i) {
            return i * i;
        }
        var expected = [0, 1, 4, 9, 16, 25];
        return async.times(6, square).then(function (value) {
            value.should.eql(expected);
        });
    });
});
describe('async.timesSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should proxy requests to async.eachSeries()', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesSeries(5, spy).then(function () {
            async.eachSeries.called.should.equal(true);
        });
    });
    it('should not loop for zero times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesSeries(0, spy).then(function () {
            async.eachSeries.called.should.equal(false);
        });
    });
    it('should not loop for negative times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesSeries(-1, spy).then(function () {
            async.eachSeries.called.should.equal(false);
        });
    });
    it('should not loop for null times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesSeries(null, spy).then(function () {
            async.eachSeries.called.should.equal(false);
        });
    });
    it('should not loop for NaN times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesSeries(Number.NaN, spy).then(function () {
            async.eachSeries.called.should.equal(false);
        });
    });
    it('should not loop for string times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesSeries('hi!', spy).then(function () {
            async.eachSeries.called.should.equal(false);
        });
    });
    it('should take floor for non integral times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesSeries(6.3, spy).then(function () {
            spy.callCount.should.equal(6);
        });
    });
    it('should execute requested number of times', function () {
        function square(i) {
            return i * i;
        }
        var expected = [0, 1, 4, 9, 16, 25];
        return async.timesSeries(6, square).then(function (value) {
            value.should.eql(expected);
        });
    });
});
describe('async.timesLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(async, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should proxy requests to async.eachLimit()', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesLimit(5, 3, spy).then(function () {
            async.eachLimit.called.should.equal(true);
        });
    });
    it('should not loop for zero times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesLimit(0, 3, spy).then(function () {
            async.eachLimit.called.should.equal(false);
        });
    });
    it('should not loop for negative times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesLimit(-1, 3, spy).then(function () {
            async.eachLimit.called.should.equal(false);
        });
    });
    it('should not loop for null times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesLimit(null, 3, spy).then(function () {
            async.eachLimit.called.should.equal(false);
        });
    });
    it('should not loop for NaN times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesLimit(Number.NaN, 3, spy).then(function () {
            async.eachLimit.called.should.equal(false);
        });
    });
    it('should not loop for string times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesLimit('hi!', 3, spy).then(function () {
            async.eachLimit.called.should.equal(false);
        });
    });
    it('should take floor for non integral times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return async.timesLimit(6.3, 3, spy).then(function () {
            spy.callCount.should.equal(6);
        });
    });
    it('should execute requested number of times', function () {
        function square(i) {
            return i * i;
        }
        var expected = [0, 1, 4, 9, 16, 25];
        return async.timesLimit(6, 3, square).then(function (value) {
            value.should.eql(expected);
        });
    });
});
