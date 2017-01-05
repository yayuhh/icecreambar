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

  lab.test('handleError is called when server.log("rollbarError"', function (done) {

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

  lab.test('reportMessage is called when server.log("rollbarError")', function (done) {

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
});
