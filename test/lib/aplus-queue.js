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
describe('aplus.queue()', function () {
    function echo(input) {
        return Promise.resolve(input);
    }
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should return an object', function () {
        chai.expect(aplus.queue(echo)).to.be.a('object');
    });
    describe('q.concurrency', function () {
        it('should have default concurrency of `1`', function () {
            aplus.queue(echo).concurrency.should.equal(1);
        });
        it('should set provided integer concurrency', function () {
            aplus.queue(echo, 7).concurrency.should.equal(7);
        });
        it('should set floor of provided decimal concurrency', function () {
            aplus.queue(echo, 5.23).concurrency.should.equal(5);
        });
        it('should use default concurrency of `1` when concurrency of `null` requested', function () {
            aplus.queue(echo, null).concurrency.should.equal(1);
        });
        it('should use default concurrency of `1` when concurrency of 0 requested', function () {
            aplus.queue(echo, 0).concurrency.should.equal(1);
        });
        it('should use default concurrency of `1` when non number concurrency requested', function () {
            aplus.queue(echo, 'banana').concurrency.should.equal(1);
        });
        it('should use default concurrency of `1` when negative concurency requested', function () {
            aplus.queue(echo, -3.14).concurrency.should.equal(1);
        });
        it('should change the concurrency on the flu', function () {
            var q = aplus.queue(echo, 1);
            q.concurrency = 5;
            q.push([0, 1, 2, 3, 4]);
            q.running().should.equal(5);
        });
    });
    describe('q.started', function () {
        it('should intially be set to false', function () {
            var q = aplus.queue(echo);
            q.started.should.equal(false);
        });
        it('should be set to true once a task is started', function () {
            var q = aplus.queue(echo);
            q.push('hi!');
            q.started.should.equal(true);
        });
    });
    describe('q.length()', function () {
        it('should have intial value of `0`', function () {
            var q = aplus.queue(echo);
            q.length().should.equal(0);
        });
        it('should reflect number of waiting tasks (concurrency: 1)', function () {
            var q = aplus.queue(echo, 1);
            q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            q.length().should.equal(9);
        });
        it('should reflect number of waiting tasks (concurrency: 3)', function () {
            var q = aplus.queue(echo, 3);
            q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            q.length().should.equal(7);
        });
        it('should reflect number of waiting tasks (concurrency: 5)', function () {
            var q = aplus.queue(echo, 5);
            q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            q.length().should.equal(5);
        });
        it('should reflect number of waiting tasks (concurrency: 10)', function () {
            var q = aplus.queue(echo, 10);
            q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            q.length().should.equal(0);
        });
        it('should reflect number of waiting tasks (on completion)', function () {
            var q = aplus.queue(echo, 1);
            return q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).then(function () {
                q.length().should.equal(0);
            });
        });
    });
    describe('q.running()', function () {
        it('should have intial value of `0`', function () {
            var q = aplus.queue(echo);
            q.running().should.equal(0);
        });
        it('should reflect number of running tasks (unsaturated: 1)', function () {
            var q = aplus.queue(echo, 5);
            q.push([0]);
            q.running().should.equal(1);
        });
        it('should reflect number of running tasks (unsaturated: 3)', function () {
            var q = aplus.queue(echo, 5);
            q.push([0, 1, 2]);
            q.running().should.equal(3);
        });
        it('should reflect number of running tasks (saturated: 5)', function () {
            var q = aplus.queue(echo, 5);
            q.push([0, 1, 2, 3, 4]);
            q.running().should.equal(5);
        });
        it('should reflect number of running tasks (supersaturated: 10)', function () {
            var q = aplus.queue(echo, 5);
            q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            q.running().should.equal(5);
        });
        it('should reflect number of running tasks (on completion)', function () {
            var q = aplus.queue(echo, 5);
            var p = q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            return p.then(function () {
                q.running().should.equal(5);
            });
        });
        it('should reflect number of running tasks (on drain)', function () {
            var q = aplus.queue(echo, 5);
            return q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).then(function () {
                q.running().should.equal(0);
            });
        });
    });
    describe('q.idle()', function () {
        it('should have intial value of `true`', function () {
            var q = aplus.queue(echo);
            q.idle().should.equal(true);
        });
        it('should be false if there are running tasks', function () {
            var q = aplus.queue(echo, 1);
            q.push([0]);
            q.idle().should.equal(false);
        });
        it('should be false if there are waiting tasks', function () {
            var q = aplus.queue(echo, 1);
            var p = q.push([0]);
            q.push([0]);
            return p.then(function () {
                q.idle().should.equal(false);
            });
        });
        it('should be false if there are no waiting tasks, nor running tasks', function () {
            var q = aplus.queue(echo, 1),
                a = q.push([0]),
                b = q.push([0]);
            return Promise.all([a, b]).then(function () {
                q.idle().should.equal(true);
            });
        });
    });
    describe('q.push()', function () {
        beforeEach(function () {
            sandbox.spy(Array.prototype.push, 'apply');
        });
        it('should add tasks via Array.push', function () {
            var q = aplus.queue(echo),
                input = ['hi!'];
            q.push(input);
            Array.prototype.push.apply.callCount.should.equal(1);
        });
        it('should resolve promise on task resolution', function () {
            var q = aplus.queue(echo);
            return q.push('hi!').then(function (value) {
                value.should.eql(['hi!']);
            });
        });
        it('should reject promise on task rejection', function () {
            var spy = sinon.stub(),
                q = aplus.queue(spy),
                error = new Error('bad error!');
            spy.returns(Promise.reject(error));
            return q.push('hi!').then(function () {
                chai.assert.fail('should not accept when task rejects');
            }).catch(function (err) {
                err.should.equal(error);
            });
        });
        it('should accept list of tasks and resolve with results of all', function () {
            var q = aplus.queue(echo);
            return q.push(['hi!', 'bye!']).then(function (value) {
                value.should.eql(['hi!', 'bye!']);
            });
        });
        it('should reject list of tasks when member task rejects', function () {
            var spy = sinon.stub(),
                q = aplus.queue(spy),
                error = new Error('i am evil error');
            spy.returns(Promise.resolve());
            spy.onCall(5).returns(Promise.reject(error));
            return q.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).then(function () {
                chai.assert.fail('should not accept when task rejects');
            }).catch(function (err) {
                err.should.equal(error);
            });
        });
    });
    describe('q.unshift()', function () {
        beforeEach(function () {
            sandbox.spy(Array.prototype, 'unshift');
        });
        it('should add tasks via Array.unshift', function () {
            var q = aplus.queue(echo),
                input = ['bye!'];
            q.unshift(input);
            Array.prototype.unshift.called.should.equal(true);
        });
        it('should resolve promise on task resolution', function () {
            var q = aplus.queue(echo);
            return q.unshift('hi!').then(function (value) {
                value.should.eql(['hi!']);
            });
        });
        it('should reject promise on task rejection', function () {
            var spy = sinon.stub(),
                q = aplus.queue(spy),
                error = new Error('bad error!');
            spy.returns(Promise.reject(error));
            return q.unshift('hi!').then(function () {
                chai.assert.fail('should not accept when task rejects');
            }).catch(function (err) {
                err.should.equal(error);
            });
        });
        it('should accept list of tasks and resolve with results of all', function () {
            var q = aplus.queue(echo);
            return q.unshift(['hi!', 'bye!']).then(function (value) {
                value.should.eql(['hi!', 'bye!']);
            });
        });
        it('should reject list of tasks when member task rejects', function () {
            var spy = sinon.stub(),
                q = aplus.queue(spy),
                error = new Error('i am evil error');
            spy.returns(Promise.resolve());
            spy.onCall(5).returns(Promise.reject(error));
            return q.unshift([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).then(function () {
                chai.assert.fail('should not accept when task rejects');
            }).catch(function (err) {
                err.should.equal(error);
            });
        });
    });
    describe('q.saturated', function () {
        it('should not fire when enqueueing tasks below the concurrency limit', function () {
            var q = aplus.queue(echo, 5);
            q.saturated = sinon.spy();
            q.push([1, 2, 3, 4]);
            q.saturated.called.should.equal(false);
        });
        it('should not fire when enqueueing tasks that reach the concurrency limit', function () {
            var q = aplus.queue(echo, 5);
            q.saturated = sinon.spy();
            q.push([1, 2, 3, 4]);
            q.saturated.called.should.equal(false);
            q.push(1);
            q.saturated.called.should.equal(true);
        });
        it('should not fire when enqueueing tasks that exceed the concurrency limit', function () {
            var q = aplus.queue(echo, 5);
            q.saturated = sinon.spy();
            q.push([1, 2, 3, 4]);
            q.saturated.called.should.equal(false);
            q.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
            q.saturated.called.should.equal(true);
        });
        it('should not error when nulled', function () {
            var q = aplus.queue(echo, 5);
            q.saturated = null;
            return q.push([1, 2, 3, 4, 5, 6]);
        });
    });
    describe('q.empty', function () {
        it('should fire when handing only task to queue', function () {
            var q = aplus.queue(echo, 5);
            q.empty = sinon.spy();
            q.push(1);
            q.empty.called.should.equal(true);
        });
        it('should fire when handing tasks below concurrency limit to workers', function () {
            var q = aplus.queue(echo, 5);
            q.empty = sinon.spy();
            q.push([1, 2, 3, 4]);
            q.empty.called.should.equal(true);
        });
        it('should not fire when enqueueing tasks that exceed the concurrency limit', function () {
            var q = aplus.queue(echo, 5);
            q.empty = sinon.spy();
            q.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
            q.empty.called.should.equal(false);
        });
        it('should not error when nulled', function () {
            var q = aplus.queue(echo, 5);
            q.empty = null;
            return q.push(1);
        });
    });
});
