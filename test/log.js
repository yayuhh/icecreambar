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

  lab.test('handleError is called when server.log("rollbarError") w/o a matching scope', function (done) {

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

  lab.test('reportMessage is called when server.log("rollbarError") w/o a matching scope', function (done) {

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

  lab.test('handleError is called when server.log("rollbarError") w/a matching scope', function (done) {

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

  lab.test('reportMessage is called when server.log("rollbarMessage") w/p a matching scope', function (done) {

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

  lab.test('reportMessage is called when request.log("rollbarMessage") w/a matching scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'frisbee'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.frisbee.reportMessage = require('sinon').spy();

      server.route({
        path: '/foo',
        method: 'get',
        handler: function(request, reply) {

          request.log(['rollbarMessage', 'frisbee'], 'foooo');
          reply();
        }
      });

      server.inject('/foo', function(/*response*/) {

        expect(server.plugins.icecreambar.frisbee.reportMessage.called).to.equal(true);
        done();
      });
    });
  });

  lab.test('handleError is called when request.log("rollbarError") w/a matching scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'frisbee'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.frisbee.handleError = require('sinon').spy();

      server.route({
        path: '/foo',
        method: 'get',
        handler: function(request, reply) {

          request.log(['rollbarError', 'frisbee'], 'foooo');
          reply();
        }
      });

      server.inject('/foo', function(/*response*/) {

        expect(server.plugins.icecreambar.frisbee.handleError.called).to.equal(true);
        done();
      });
    });
  });

  lab.test('reportMessage is NOT called when request.log("rollbarMessage") w/a matching scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'golf'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.golf.reportMessage = require('sinon').spy();

      server.route({
        path: '/foo',
        method: 'get',
        handler: function(request, reply) {

          request.log(['rollbarMessage', 'frisbee'], 'foooo');
          reply();
        }
      });

      server.inject('/foo', function(/*response*/) {

        expect(server.plugins.icecreambar.golf.reportMessage.called).to.equal(false);
        done();
      });
    });
  });

  lab.test('handleError is NOT called when request.log("rollbarError") w/a scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'golf'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.golf.handleError = require('sinon').spy();

      server.route({
        path: '/foo',
        method: 'get',
        handler: function(request, reply) {

          request.log(['rollbarError', 'frisbee'], 'foooo');
          reply();
        }
      });

      server.inject('/foo', function(/*response*/) {

        expect(server.plugins.icecreambar.golf.handleError.called).to.equal(false);
        done();
      });
    });
  });

  lab.test('reportMessage is called when request.log("rollbarMessage") w/o a matching scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.default.reportMessage = require('sinon').spy();

      server.route({
        path: '/foo',
        method: 'get',
        handler: function(request, reply) {

          request.log(['rollbarMessage'], 'foooo');
          reply();
        }
      });

      server.inject('/foo', function(/*response*/) {

        expect(server.plugins.icecreambar.default.reportMessage.called).to.equal(true);
        done();
      });
    });
  });

  lab.test('handleError is called when request.log("rollbarError") w/o a scope', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.default.handleError = require('sinon').spy();

      server.route({
        path: '/foo',
        method: 'get',
        handler: function(request, reply) {

          request.log(['rollbarError'], 'foooo');
          reply();
        }
      });

      server.inject('/foo', function(/*response*/) {

        expect(server.plugins.icecreambar.default.handleError.called).to.equal(true);
        done();
      });
    });
  });
});
