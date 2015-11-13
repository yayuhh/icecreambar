const Hapi = require('hapi');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');
const Plugin = {
  register: require('../index.js'),
  options: {
    'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
  }
};

const expect = Code.expect;
const lab = exports.lab = Lab.script();

let server;

lab.experiment('server', function () {

  lab.beforeEach(function(done) {

    server = new Hapi.Server();
    server.connection({ port: 80, labels: 'a' });
    server.connection({ port: 8080, labels: 'b' });

    // suppress internal output
    console.error = function(){};

    done();
  });


  lab.test('can successfully register the plugin', function (done) {

    server.register({
      register: require('../index.js'),
      options: { 'accessToken': '58b67946b9af48e8ad07595afe9d63b2' }
    }, function (err) {

      expect(err).to.equal(undefined);
      done();
    });
  });

  lab.test('can successfully register the plugin twice', function (done) {

    server.register({
      register: require('../index.js'),
      options: { scope: 'foo', 'accessToken': '58b67946b9af48e8ad07595afe9d63b2' }
    }, function (err1) {

      expect(err1).to.equal(undefined);

      server.register({
        register: Plugin.register,
        options: { scope: 'bar', 'accessToken': '58b67946b9af48e8ad07595afe9d63b2'}
      }, function (err2) {

        expect(err2).to.equal(undefined);
        done();
      });
    });
  });

  lab.test('does not require the `scope` param when registering the first time', function (done) {

    server.register(Plugin, function (err) {
      expect(err).to.equal(undefined);
      done();
    });
  });

  lab.test('requires the `scope` param when registering the second time', function (done) {

    server.register({
      register: require('../index.js'),
      options: { 'accessToken': '58b67946b9af48e8ad07595afe9d63b2' }
    }, function (err1) {

      expect(err1).to.equal(undefined);

      server.register({
        register: Plugin.register,
        options: { 'accessToken': '58b67946b9af48e8ad07595afe9d63b2'}
      }, function (err2) {

        expect(err2).to.exist();
        done();
      });
    });
  });

  lab.test('handleError is called when a response is 5xx', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'foo'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.foo.handleError = require('sinon').spy();
    });

    server.route({
      method: 'get',
      path: '/foo',
      handler: function(request, reply) {

        reply(Boom.badImplementation());
      }
    });

    server.connections[0].inject('/foo', function(/*request, reply*/) {

      expect(server.plugins.icecreambar.foo.handleError.called).to.equal(true);
      done();
    });
  });

  lab.test('rollbar.handleError reports arbitrary errors reply`d in handlers', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'foo'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.foo.handleError = require('sinon').spy(function(foo, bar, cb) {
        cb(new Error('foo'));
      });
    });

    server.route({
      method: 'get',
      path: '/foo',
      handler: function(request, reply) {

        reply(Boom.badRequest('test'));
      }
    });

    server.connections[0].inject('/foo', function(/*request, reply*/) {

      expect(server.plugins.icecreambar.foo.handleError.called).to.equal(true);
      done();
    });
  });

  lab.test('handleError is not called when the handler response is not an error', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'scope': 'foo'
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.foo.handleError = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          reply('blah');
        }
      });

      server.connections[0].inject('/foo', function(/*request, reply*/) {

        expect(server.plugins.icecreambar.foo.handleError.called).to.equal(false);
        done();
      });
    });
  });

  lab.test('appropriate plugin instance handles error based on path', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        scope: 'foo',
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'relevantPaths': ['/foo']
      }
    }, function (err1) {

      expect(err1).to.equal(undefined);

      server.register({
        register: Plugin.register,
        options: {
          'scope': 'bar',
          'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
          'relevantPaths': ['/bar']
        }
      }, function (err2) {

        expect(err2).to.equal(undefined);

      server.plugins.icecreambar.foo.handleError = require('sinon').spy();
      server.plugins.icecreambar.bar.handleError = require('sinon').spy();


        server.route({
          method: 'get',
          path: '/foo',
          handler: function(request, reply) {

            reply(Boom.badImplementation());
          }
        });

        server.route({
          method: 'get',
          path: '/bar',
          handler: function(request, reply) {

            reply(Boom.badImplementation());
          }
        });

        server.connections[0].inject('/foo', function(/*request, reply*/) {

          // node caches the result of `require('rollbar')` thus both
          // `icecreambar.foo` and `icecreambar.bar` are the same object in memory
          expect(server.plugins.icecreambar.foo).to.equal(server.plugins.icecreambar.bar);
          expect(server.plugins.icecreambar.foo.handleError.calledOnce).to.equal(true);
          expect(server.plugins.icecreambar.bar.handleError.calledOnce).to.equal(true);
          done();
        });
      });
    });
  });
});
