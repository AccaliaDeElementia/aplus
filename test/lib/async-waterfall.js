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
    it('should pass seed argument to first function', function () {
        var expected = {
                a: 0
            },
            input = [
                function (arg) {
                    chai.expect(arg).to.equal(expected);
                    return Promise.resolve(1);
                },
                function (arg) {
                    arg.should.equal(1);
                    return Promise.resolve(5);
                }
            ];
        return aplus.waterfall(input, expected);
    });
});
describe('aplus.seq()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'waterfall');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should return a function', function () {
        chai.expect(aplus.seq([])).to.be.a('function');
    });
    it('should call aplus.waterfall when executed', function () {
        var seq = aplus.seq([function () {
            return 1;
        }]);
        return seq().then(function () {
            aplus.waterfall.called.should.equal(true);
        });
    });
    it('should pass array of tasks to aplus.waterfall when executed', function () {
        var tasks = [function () {
                return 1;
            }],
            seq = aplus.seq(tasks);
        return seq().then(function () {
            aplus.waterfall.firstCall.args[0].should.eql(tasks);
        });
    });
    it('should seed argument to aplus.waterfall when executed', function () {
        var seq = aplus.seq([function () {
            return 1;
        }]);
        return seq('i am legend').then(function () {
            aplus.waterfall.firstCall.args[1].should.eql('i am legend');
        });
    });
    it('should resolve with value of last function in chain', function () {
        var seq = aplus.seq([function () {
            return 1;
        }, function () {
            return 2;
        }, function () {
            return 3;
        }, function () {
            return 4;
        }]);
        return seq().then(function (value) {
            value.should.equal(4);
        });
    });
});
describe('aplus.compose()', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.spy(aplus, 'waterfall');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should return a function', function () {
        chai.expect(aplus.compose([])).to.be.a('function');
    });
    it('should call aplus.waterfall when executed', function () {
        var compose = aplus.compose([function () {
            return 1;
        }]);
        return compose().then(function () {
            aplus.waterfall.called.should.equal(true);
        });
    });
    it('should pass array of tasks to aplus.waterfall when executed', function () {
        var tasks = [function () {
                return 1;
            }, function () {
                return 2;
            }],
            expected = tasks.slice().reverse(),
            compose = aplus.compose(tasks);
        return compose().then(function () {
            aplus.waterfall.firstCall.args[0].should.eql(expected);
        });
    });
    it('should seed argument to aplus.waterfall when executed', function () {
        var compose = aplus.compose([function () {
            return 1;
        }]);
        return compose('i am legend').then(function () {
            aplus.waterfall.firstCall.args[1].should.eql('i am legend');
        });
    });
    it('should resolve with value of first function in input list', function () {
        var compose = aplus.compose([function () {
            return 1;
        }, function () {
            return 2;
        }, function () {
            return 3;
        }, function () {
            return 4;
        }]);
        return compose().then(function (value) {
            value.should.equal(1);
        });
    });
});
