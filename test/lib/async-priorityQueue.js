'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    sinon = require('sinon');

if (!global.Promise) {
    global.Promise = require('promise-polyfill');
}
Promise.delay = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};
chai.use(chaiAsPromised);
chai.should();

var aplus = require('../../lib/aplus');
describe('aplus.priorityQueue()', function () {
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
        chai.expect(aplus.priorityQueue(echo)).to.be.a('object');
    });
    describe('values', function () {
        describe('q.concurrency', function () {
            it('should have default concurrency of `1`', function () {
                aplus.priorityQueue(echo).concurrency.should.equal(1);
            });
            it('should set provided integer concurrency', function () {
                aplus.priorityQueue(echo, 7).concurrency.should.equal(7);
            });
            it('should set floor of provided decimal concurrency', function () {
                aplus.priorityQueue(echo, 5.23).concurrency.should.equal(5);
            });
            it('should use default concurrency of `1` when concurrency of `null` requested', function () {
                aplus.priorityQueue(echo, null).concurrency.should.equal(1);
            });
            it('should use default concurrency of `1` when concurrency of 0 requested', function () {
                aplus.priorityQueue(echo, 0).concurrency.should.equal(1);
            });
            it('should use default concurrency of `1` when non number concurrency requested', function () {
                aplus.priorityQueue(echo, 'banana').concurrency.should.equal(1);
            });
            it('should use default concurrency of `1` when negative concurency requested', function () {
                aplus.priorityQueue(echo, -3.14).concurrency.should.equal(1);
            });
            it('should change the concurrency on the flu', function () {
                var q = aplus.priorityQueue(echo, 1);
                q.concurrency = 5;
                q.push([0, 1, 2, 3, 4]);
                q.running().should.equal(5);
            });
        });
        describe('q.started', function () {
            it('should intially be set to false', function () {
                var q = aplus.priorityQueue(echo);
                q.started.should.equal(false);
            });
            it('should be set to true once a task is started', function () {
                var q = aplus.priorityQueue(echo);
                q.push('hi!');
                q.started.should.equal(true);
            });
        });
        describe('q.paused', function () {
            it('should not be paused on creation', function () {
                var q = aplus.priorityQueue(echo);
                q.paused.should.equal(false);
            });
            it('should transition to paused on call to q.pause()', function () {
                var q = aplus.priorityQueue(echo);
                q.pause();
                q.paused.should.equal(true);
            });
            it('should transition to unpaused on call to q.resume()', function () {
                var q = aplus.priorityQueue(echo);
                q.paused = true;
                q.resume();
                q.paused.should.equal(false);
            });
        });
    });
    describe('functions', function () {
        describe('q.length()', function () {
            it('should have intial value of `0`', function () {
                var q = aplus.priorityQueue(echo);
                q.length().should.equal(0);
            });
            it('should reflect number of waiting tasks (concurrency: 1)', function () {
                var q = aplus.priorityQueue(echo, 1);
                q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                q.length().should.equal(9);
            });
            it('should reflect number of waiting tasks (concurrency: 3)', function () {
                var q = aplus.priorityQueue(echo, 3);
                q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                q.length().should.equal(7);
            });
            it('should reflect number of waiting tasks (concurrency: 5)', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                q.length().should.equal(5);
            });
            it('should reflect number of waiting tasks (concurrency: 10)', function () {
                var q = aplus.priorityQueue(echo, 10);
                q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                q.length().should.equal(0);
            });
            it('should reflect number of waiting tasks (on completion)', function () {
                var q = aplus.priorityQueue(echo, 1);
                return q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).then(function () {
                    q.length().should.equal(0);
                });
            });
        });
        describe('q.running()', function () {
            it('should have intial value of `0`', function () {
                var q = aplus.priorityQueue(echo);
                q.running().should.equal(0);
            });
            it('should reflect number of running tasks (unsaturated: 1)', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.push([0]);
                q.running().should.equal(1);
            });
            it('should reflect number of running tasks (unsaturated: 3)', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.push([0, 1, 2]);
                q.running().should.equal(3);
            });
            it('should reflect number of running tasks (saturated: 5)', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.push([0, 1, 2, 3, 4]);
                q.running().should.equal(5);
            });
            it('should reflect number of running tasks (supersaturated: 10)', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                q.running().should.equal(5);
            });
            it('should reflect number of running tasks (on completion)', function () {
                function worker() {
                    return Promise.delay(20);
                }
                var q = aplus.priorityQueue(worker, 5);
                var p = q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                return p.then(function () {
                    q.running().should.equal(5);
                });
            });
            it('should reflect number of running tasks (on drain)', function () {
                var q = aplus.priorityQueue(echo, 5);
                return q.push([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).then(function () {
                    q.running().should.equal(0);

                });
            });
        });
        describe('q.idle()', function () {
            it('should have intial value of `true`', function () {
                var q = aplus.priorityQueue(echo);
                q.idle().should.equal(true);
            });
            it('should be false if there are running tasks', function () {
                var q = aplus.priorityQueue(echo, 1);
                q.push([0]);
                q.idle().should.equal(false);
            });
            it('should be false if there are waiting tasks', function () {
                function worker() {
                    return Promise.delay(20);
                }
                var q = aplus.priorityQueue(worker, 1);
                var p = q.push([0]);
                q.push([0]);
                return p.then(function () {
                    q.idle().should.equal(false);
                });
            });
            it('should be false if there are no waiting tasks, nor running tasks', function () {
                function worker() {
                    return Promise.delay(20);
                }
                var q = aplus.priorityQueue(worker, 1),
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
                var q = aplus.priorityQueue(echo),
                    input = ['hi!'];
                q.push(input);
                Array.prototype.push.apply.callCount.should.equal(1);
            });
            it('should resolve promise on task resolution', function () {
                var q = aplus.priorityQueue(echo);
                return q.push('hi!').then(function (value) {
                    value.should.eql(['hi!']);
                });
            });
            it('should reject promise on task rejection', function () {
                var spy = sinon.stub(),
                    q = aplus.priorityQueue(spy),
                    error = new Error('bad error!');
                spy.returns(Promise.reject(error));
                return q.push('hi!').then(function () {
                    chai.assert.fail('should not accept when task rejects');
                }).catch(function (err) {
                    err.should.equal(error);
                });
            });
            it('should accept list of tasks and resolve with results of all', function () {
                var q = aplus.priorityQueue(echo);
                return q.push(['hi!', 'bye!']).then(function (value) {
                    value.should.eql(['hi!', 'bye!']);
                });
            });
            it('should reject list of tasks when member task rejects', function () {
                var spy = sinon.stub(),
                    q = aplus.priorityQueue(spy),
                    error = new Error('i am evil error');
                spy.returns(Promise.resolve());
                spy.onCall(5).returns(Promise.reject(error));
                return q.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).then(function () {
                    chai.assert.fail('should not accept when task rejects');
                }).catch(function (err) {
                    err.should.equal(error);
                });
            });
            it('should report errors via the progress callback', function () {
                var spy = sinon.stub(),
                    progress = sinon.spy(),
                    q = aplus.priorityQueue(spy),
                    error = new Error('i am evil error');
                spy.returns(Promise.resolve());
                spy.onCall(5).returns(Promise.reject(error));
                return q.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 0, progress).catch(function () {
                    progress.calledWith(error).should.equal(true);
                });
            });
            it('should report progress via the progress callback', function () {
                var q = aplus.priorityQueue(echo),
                    input = [1, 2, 3, 4, 5, 6, 7, 8, 9],
                    spy = sinon.spy();
                return q.push(input, 0, spy).then(function () {
                    spy.callCount.should.equal(input.length);
                    input.forEach(function (value) {
                        spy.calledWith(null, value).should.equal(true);
                    });
                });
            });
            it('should put low priority tasts to end of queue', function () {
                var spy = sinon.spy(),
                    q = aplus.priorityQueue(spy, 1);
                q.pause();
                var tasks = [q.push(5, 1),
                    q.push(3, 0),
                    q.push(4, 2)
                ];
                q.resume();
                return Promise.all(tasks).then(function () {
                    spy.thirdCall.args[0].should.equal(4);
                });
            });
            it('should put high priority tasts at beginning of queue', function () {
                var spy = sinon.spy(),
                    q = aplus.priorityQueue(spy, 1);
                q.pause();
                var tasks = [q.push(5, 1),
                    q.push(3, 0),
                    q.push(4, 2)
                ];
                q.resume();
                return Promise.all(tasks).then(function () {
                    spy.firstCall.args[0].should.equal(3);
                });
            });
            it('should order tasks as expected according to priotity', function () {
                var q = aplus.priorityQueue(function () {}, 1),
                    expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                q.pause();
                [8, 6, 5, 3, 9, 2, 1, 7, 0, 4].forEach(function (t) {
                    q.push(t, t);
                });
                q._tasks.map(function (t) {
                    return t.priority;
                }).should.eql(expected);
                q.resume();
            });
        });
        describe('q.pause()', function () {
            it('should not start new tasks when paused', function () {
                var spy = sinon.spy(echo),
                    q = aplus.priorityQueue(spy);
                q.pause();
                q.push(4);
                spy.called.should.equal(false);
            });
        });
        describe('q.resume()', function () {
            it('should start new tasks when resumed', function () {
                var spy = sinon.spy(echo),
                    q = aplus.priorityQueue(spy);
                q.paused = true;
                q.push(4);
                q.resume();
                spy.called.should.equal(true);
            });
        });
        describe('q.kill()', function () {
            it('should pause priorityQueue on kill', function () {
                var q = aplus.priorityQueue(echo);
                q.kill();
                q.paused.should.equal(true);
            });
            it('should remove unstarted tasks on kill', function () {
                var q = aplus.priorityQueue(echo);
                q.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
                q.kill();
                q.length().should.equal(0);
            });
        });
    });
    describe('status callbacks', function () {
        describe('q.saturated', function () {
            it('should not fire when enpriorityQueueing tasks below the concurrency limit', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.saturated = sinon.spy();
                q.push([1, 2, 3, 4]);
                q.saturated.called.should.equal(false);
            });
            it('should not fire when enpriorityQueueing tasks that reach the concurrency limit', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.saturated = sinon.spy();
                q.push([1, 2, 3, 4]);
                q.saturated.called.should.equal(false);
                q.push(1);
                q.saturated.called.should.equal(true);
            });
            it('should not fire when enpriorityQueueing tasks that exceed the concurrency limit', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.saturated = sinon.spy();
                q.push([1, 2, 3, 4]);
                q.saturated.called.should.equal(false);
                q.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
                q.saturated.called.should.equal(true);
            });
            it('should not error when nulled', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.saturated = null;
                return q.push([1, 2, 3, 4, 5, 6]);
            });
        });
        describe('q.empty', function () {
            it('should fire when handing only task to priorityQueue', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.empty = sinon.spy();
                q.push(1);
                q.empty.called.should.equal(true);
            });
            it('should fire when handing tasks below concurrency limit to workers', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.empty = sinon.spy();
                q.push([1, 2, 3, 4]);
                q.empty.called.should.equal(true);
            });
            it('should not fire when enpriorityQueueing tasks that exceed the concurrency limit', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.empty = sinon.spy();
                q.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
                q.empty.called.should.equal(false);
            });
            it('should not error when nulled', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.empty = null;
                return q.push(1);
            });
        });
        describe('q.drain', function () {
            it('should fire when finishing only task in priorityQueue', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.drain = sinon.spy();
                var p = q.push(1);
                q.drain.called.should.equal(false);
                return p.then(function () {
                    q.drain.called.should.equal(true);
                });
            });
            it('should not fire on task completion when other tasks are still running', function () {
                function worker() {
                    return Promise.delay(20);
                }
                var q = aplus.priorityQueue(worker, 1);
                q.drain = sinon.spy();
                var p = q.push(1);
                q.push([1, 2, 3, 4]);
                return p.then(function () {
                    q.drain.called.should.equal(false);
                });
            });
            it('should not fire on task completion when other tasks are still priorityQueued', function () {
                function worker() {
                    return Promise.delay(20);
                }
                var q = aplus.priorityQueue(worker, 1);
                q.drain = sinon.spy();
                var p = q.push(1);
                q.push([1, 2, 3, 4]);
                return p.then(function () {
                    q.drain.called.should.equal(false);
                });
            });
            it('should not error when nulled', function () {
                var q = aplus.priorityQueue(echo, 5);
                q.drain = null;
                return q.push(1);
            });
        });
    });
});
