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

describe('aplus.waterfall()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'eachSeries');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should spawn processes via aplus.eachSeries', function () {
        var input = [function () {
            return Promise.resolve(1);
        }];
        return aplus.waterfall(input).then(function () {
            aplus.eachSeries.called.should.equal(true);
        });
    });
    it('should resolve to final function\'s value', function () {
        var expected = Math.random(),
            input = [function () {
                return Promise.resolve(1);
            }, function () {
                return Promise.resolve(1);
            }, function () {
                return Promise.resolve(1);
            }, function () {
                return Promise.resolve(expected);
            }];
        return aplus.waterfall(input).then(function (value) {
            value.should.equal(expected);
        });
    });
    it('should pass intermediate values to next functions', function () {
        var input = [
            function (arg) {
                chai.expect(arg).to.equal(undefined);
                return Promise.resolve(1);
            },
            function (arg) {
                arg.should.equal(1);
                return Promise.resolve(5);
            },
            function (arg) {
                arg.should.equal(5);
                return Promise.resolve('hi');
            },
            function (arg) {
                arg.should.equal('hi');
                return Promise.resolve(9);
            }
        ];
        return aplus.waterfall(input);
    });
});
