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

  lab.test('handleErrorWithPayloadData is called when a response is 5xx', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'get',
        path: '/foo',
        handler: function(request, reply) {

          reply(Boom.badImplementation());
        }
      });

      server.connections[0].inject('/foo', function(request, reply) {
        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
        done();
      });
    });
  });

  lab.test('handleErrorWithPayloadData is called when a response is 4xx', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {

      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'get',
        path: '/foo',
        handler: function(request, reply) {

          reply(Boom.badRequest());
        }
      });

      server.connections[0].inject('/foo', function(/*request, reply*/) {
        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
        done();
      });
    });
  });

  lab.test('handleErrorWithPayloadData is not called when the handler response is not an error', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          reply();
        }
      });

      server.connections[0].inject('/foo', function(/*request, reply*/) {

        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(false);
        done();
      });
    });
  });

  lab.test('handleError is not called when the response status is ignored', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        omittedResponseCodes: [404]
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          reply(Boom.notFound());
        }
      });

      server.connections[0].inject('/foo', function(/*request, reply*/) {

        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(false);
        done();
      });
    });
  });

  lab.test('request.log reports an error when it includes the rollbarError tag', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          request.log(['rollbarError'], 'ruh-roh!');
          reply();
        }
      });

      server.connections[0].inject('/foo', function(request/*, reply*/) {

        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
        done();
      });
    });
  });

  lab.test('request.log reports an error when it includes the rollbarError tag and no data', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          request.log(['rollbarError']);
          reply();
        }
      });

      server.connections[0].inject('/foo', function(request/*, reply*/) {

        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
        done();
      });
    });
  });

  lab.test('request.log reports a message when it includes the rollbarMessage tag', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.reportMessage = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          request.log(['rollbarMessage'], 'ruh-roh!');
          reply();
        }
      });

      server.connections[0].inject('/foo', function(request/*, reply*/) {

        expect(server.plugins.icecreambar.reportMessage.called).to.equal(true);
        done();
      });
    });
  });

  lab.test('request.log reports an error with custom data when it includes custom data', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          const err = Boom.create(501);
          err.data = 'arbitrary stuff';
          reply(err);
        }
      });

      server.connections[0].inject('/foo', function(request/*, reply*/) {

        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
        expect(server.plugins.icecreambar.handleErrorWithPayloadData.args[0][1].custom).to.exist;
        done();
      });
    });
  });

  lab.test('ignore 4xx responses that are not errors', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          reply({}).code(403);
        }
      });

      server.connections[0].inject('/foo', function(request/*, reply*/) {

        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(false);
        done();
      });
    });
  });

  lab.test('ignore 5xx responses that are not errors', function (done) {

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          reply({}).code(501);
        }
      });

      server.connections[0].inject('/foo', function(request/*, reply*/) {

        expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(false);
        done();
      });
    });
  });

  lab.test('correct rollbar_person property is sent to rollbar', function (done) {

    var sinon = require('sinon');

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
        'personTracking' : {}
      }
    }, function (/*err*/) {
      server.plugins.icecreambar.handleErrorWithPayloadData = sinon.spy();

      server.route({
        method: 'GET',
        path: '/foo',
        handler: function(request, reply) {

          request.auth.credentials = {
            'id' : 42,
            'email' : 'test@email.com',
            'username' : 'test'
          }

          const err = Boom.create(501);
          err.data = 'arbitrary stuff';
          reply(err);
        }
      });

      server.connections[0].inject('/foo', function(request/*, reply*/) {
        expect(server.plugins.icecreambar.handleErrorWithPayloadData.args[0][2].rollbar_person).to.equal({
          'id' : 42,
          'email' : 'test@email.com',
          'username' : 'test'
        });
        done();        
      });
    });
  });
});
