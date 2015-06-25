const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');

const expect = Code.expect;
const lab = exports.lab = Lab.script();

let server;

lab.experiment('log', function () {

  lab.beforeEach(function(done) {

    server = new Hapi.Server();
    server.connection({});
    done();
  });

  lab.test('handleError is called when server.log("rollbarError") w/o a scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.default.handleError = require('sinon').spy();
      server.log(['rollbarError'], 'foooo');
      expect(server.plugins.icecreambar.default.handleError.called).to.equal(true);
      done();
    });
  });

  lab.test('reportMessage is called when server.log("rollbarError") w/o a scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.default.reportMessage = require('sinon').spy();
      server.log(['rollbarMessage'], 'foooo');
      expect(server.plugins.icecreambar.default.reportMessage.called).to.equal(true);
      done();
    });
  });

  lab.test('handleError is called when server.log("rollbarError") w/a scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'foo'
      }
    }, function (err) {

      expect(err).to.be.undefined();

      server.plugins.icecreambar.foo.handleError = require('sinon').spy();
      server.log(['rollbarError', 'foo'], 'barf1234');
      expect(server.plugins.icecreambar.foo.handleError.called).to.equal(true);

      done();
    });
  });

  lab.test('reportMessage is called when server.log("rollbarError") w/a a scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'frisbee'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.frisbee.reportMessage = require('sinon').spy();
      server.log(['rollbarMessage', 'frisbee'], 'foooo');
      expect(server.plugins.icecreambar.frisbee.reportMessage.called).to.equal(true);
      done();
    });
  });

  lab.test('handleError is not called when server.log("rollbarError") w/o a matching scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'foo'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.foo.handleError = require('sinon').spy();
      server.log(['rollbarError', 'bar'], 'barf1234');
      expect(server.plugins.icecreambar.foo.handleError.called).to.equal(false);
      done();
    });
  });

  lab.test('rollbarLog passes `info` as default level', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'foo'
      }
    }, function (/*err*/) {

      const rbar = server.plugins.icecreambar.foo;
      rbar.reportMessage = require('sinon').spy();

      const rollbarLog = require('../index.js').rollbarLog;
      const log = rollbarLog(rbar, 'foo');
      log({ msg: 'foo', level: 'danger-zone' }, {'rollbarMessage': true, 'foo': true});

      expect(rbar.reportMessage.called).to.equal(true);
      done();
    });
  });

  lab.test('ignores logs that are neither rollbarError nor rollbarMessage', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {

      const rbar = server.plugins.icecreambar.default;
      rbar.reportMessage = require('sinon').spy();

      const rollbarLog = require('../index.js').rollbarLog;
      const log = rollbarLog(rbar, 'foo');
      log({ msg: 'foo', level: 'danger-zone' }, {'its-not-a-rollbar': true });

      expect(rbar.reportMessage.called).to.equal(false);
      done();
    });
  });
});
