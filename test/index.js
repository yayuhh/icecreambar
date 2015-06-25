const Hapi = require('hapi');
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
    server.connection({});

    done();
  });


  lab.test('can successfully register the plugin', function (done) {

    server.register(Plugin, function (err) {

      expect(err).to.equal(undefined);
      done();
    });
  });

  lab.test('handleError is called when a response is 5xx', function (done) {

    server.register(Plugin, function (/*err*/) {

      server.plugins.icecreambar.rollbar.handleError = require('sinon').spy();
    });

    server.route({
      method: 'get',
      path: '/foo',
      handler: function(request, reply) {

        reply(require('Boom').badImplementation());
      }
    });

    server.inject('/foo', function(/*request, reply*/) {

      expect(server.plugins.icecreambar.rollbar.handleError.called).to.equal(true);
      done();
    });
  });

  lab.test('handleError is not called when a response is not Boom', function (done) {

    server.register(Plugin, function (/*err*/) {
      server.plugins.icecreambar.rollbar.handleError = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          reply('blah');
        }
      });

      server.inject('/foo', function(/*request, reply*/) {

        expect(server.plugins.icecreambar.rollbar.handleError.called).to.equal(false);
        done();
      });
    });
  });

  lab.test('rollbar.handleError reports arbitrary errors reply`d in handlers', function (done) {

    server.register(Plugin, function (/*err*/) {

      server.plugins.icecreambar.rollbar.handleError = require('sinon').spy(function(foo, bar, cb) {
        cb(new Error('foo'));
      });
    });

    server.route({
      method: 'get',
      path: '/foo',
      handler: function(request, reply) {

        reply(require('Boom').badRequest('test'));
      }
    });

    server.inject('/foo', function(/*request, reply*/) {

      expect(server.plugins.icecreambar.rollbar.handleError.called).to.equal(true);
      done();
    });
  });
});
