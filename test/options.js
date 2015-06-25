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

  lab.test('specified environment is passed to rollbar', function (done) {

    const Plugin = require('../index');
    Plugin.Rollbar = require('sinon').spy();

    server.register({
      register: require('../index.js'),
      options: {
        'environment': 'foo',
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {

      expect(Plugin.Rollbar.getCall(0).args[1].environment).to.equal('foo');
      done();
    });
  });

  lab.test('process.env.NODE_ENV is used as environment when none specified', function (done) {

    const Plugin = require('../index');
    Plugin.Rollbar = require('sinon').spy();

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (/*err*/) {

      expect(Plugin.Rollbar.getCall(0).args[1].environment).to.equal(process.env.NODE_ENV);
      done();
    });
  });

  lab.test('`development` is used as environment when none specified and NODE_ENV is unset', function (done) {

    const Plugin = require('../index');
    Plugin.Rollbar = require('sinon').spy();

    const originalNodeEnv = process.env.NODE_ENV;
    delete process.env.NODE_ENV;

    server.register({
      register: require('../index.js'),
      options: {
        'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
      }
    }, function (err) {

      expect(err).to.be.undefined();
      expect(Plugin.Rollbar.getCall(0).args[1].environment).to.equal('development');
      process.env.NODE_ENV = originalNodeEnv;
      done();
    });
  });
});
