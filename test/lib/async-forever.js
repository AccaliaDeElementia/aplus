'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised');
    
if (!global.Promise) {
    global.Promise = require('promise-polyfill');
}
chai.use(chaiAsPromised);
chai.should();

var async = require('../../lib/async-as-promised');

describe('async.forever()', function () {
    it('should loop until inner promise rejects', function () {
        var target = Math.ceil(Math.random() * 20) + 10,
            count = 0,
            expected = new Error('hi!');

        function task() {
            count++;
            if (count > target) {
                throw expected;
            }
            return Promise.resolve(count);
        }
        return async.forever(task).catch(function (err) {
            err.should.equal(expected);
        });
    });
    it('should termintate loop when exception is thrown', function () {
        var expected = new Error('hi!');

        function task() {
            throw expected;
        }
        return async.forever(task).catch(function (err) {
            err.should.equal(expected);
        });
    });
    it('should termintate loop when task rejects', function () {
        var expected = new Error('hi!');

        function task() {
            return Promise.reject(expected);
        }
        return async.forever(task).catch(function (err) {
            err.should.equal(expected);
        });
    });
});
