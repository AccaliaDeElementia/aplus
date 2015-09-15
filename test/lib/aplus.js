'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised');

if (!global.Promise) {
    global.Promise = require('promise-polyfill');
}
chai.use(chaiAsPromised);
chai.should();

var aplus = require('../../lib/aplus');
describe('aplus', function () {
    describe('setPromise()', function () {
        afterEach(function () {
            aplus.resetPromise();
        });
        it('should set aplus.Promise', function () {
            var value = Math.random();
            aplus.setPromise(value);
            aplus.Promise.should.equal(value);
        });
    });
    describe('resetPromise()', function () {
        afterEach(function () {
            aplus.resetPromise();
        });
        it('should restore aplus.Promise', function () {
            var value = aplus.Promise;
            aplus.Promise = Math.random();
            aplus.resetPromise();
            aplus.Promise.should.equal(value);
        });
    });
});
