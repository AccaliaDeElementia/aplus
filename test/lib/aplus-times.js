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

describe('aplus.times()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'each');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should proxy requests to aplus.each()', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.times(5, spy).then(function () {
            aplus.each.called.should.equal(true);
        });
    });
    it('should not loop for zero times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.times(0, spy).then(function () {
            aplus.each.called.should.equal(false);
        });
    });
    it('should not loop for negative times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.times(-1, spy).then(function () {
            aplus.each.called.should.equal(false);
        });
    });
    it('should not loop for null times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.times(null, spy).then(function () {
            aplus.each.called.should.equal(false);
        });
    });
    it('should not loop for NaN times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.times(Number.NaN, spy).then(function () {
            aplus.each.called.should.equal(false);
        });
    });
    it('should not loop for string times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.times('hi!', spy).then(function () {
            aplus.each.called.should.equal(false);
        });
    });
    it('should take floor for non integral times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.times(6.3, spy).then(function () {
            spy.callCount.should.equal(6);
        });
    });
    it('should execute requested number of times', function () {
        function square(i) {
            return i * i;
        }
        var expected = [0, 1, 4, 9, 16, 25];
        return aplus.times(6, square).then(function (value) {
            value.should.eql(expected);
        });
    });
});
describe('aplus.timesSeries()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should proxy requests to aplus.eachSeries()', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesSeries(5, spy).then(function () {
            aplus.eachSeries.called.should.equal(true);
        });
    });
    it('should not loop for zero times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesSeries(0, spy).then(function () {
            aplus.eachSeries.called.should.equal(false);
        });
    });
    it('should not loop for negative times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesSeries(-1, spy).then(function () {
            aplus.eachSeries.called.should.equal(false);
        });
    });
    it('should not loop for null times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesSeries(null, spy).then(function () {
            aplus.eachSeries.called.should.equal(false);
        });
    });
    it('should not loop for NaN times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesSeries(Number.NaN, spy).then(function () {
            aplus.eachSeries.called.should.equal(false);
        });
    });
    it('should not loop for string times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesSeries('hi!', spy).then(function () {
            aplus.eachSeries.called.should.equal(false);
        });
    });
    it('should take floor for non integral times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesSeries(6.3, spy).then(function () {
            spy.callCount.should.equal(6);
        });
    });
    it('should execute requested number of times', function () {
        function square(i) {
            return i * i;
        }
        var expected = [0, 1, 4, 9, 16, 25];
        return aplus.timesSeries(6, square).then(function (value) {
            value.should.eql(expected);
        });
    });
});
describe('aplus.timesLimit()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachLimit');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should proxy requests to aplus.eachLimit()', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesLimit(5, 3, spy).then(function () {
            aplus.eachLimit.called.should.equal(true);
        });
    });
    it('should not loop for zero times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesLimit(0, 3, spy).then(function () {
            aplus.eachLimit.called.should.equal(false);
        });
    });
    it('should not loop for negative times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesLimit(-1, 3, spy).then(function () {
            aplus.eachLimit.called.should.equal(false);
        });
    });
    it('should not loop for null times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesLimit(null, 3, spy).then(function () {
            aplus.eachLimit.called.should.equal(false);
        });
    });
    it('should not loop for NaN times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesLimit(Number.NaN, 3, spy).then(function () {
            aplus.eachLimit.called.should.equal(false);
        });
    });
    it('should not loop for string times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesLimit('hi!', 3, spy).then(function () {
            aplus.eachLimit.called.should.equal(false);
        });
    });
    it('should take floor for non integral times', function () {
        var spy = sinon.stub();
        spy.returns(5);
        return aplus.timesLimit(6.3, 3, spy).then(function () {
            spy.callCount.should.equal(6);
        });
    });
    it('should execute requested number of times', function () {
        function square(i) {
            return i * i;
        }
        var expected = [0, 1, 4, 9, 16, 25];
        return aplus.timesLimit(6, 3, square).then(function (value) {
            value.should.eql(expected);
        });
    });
});
