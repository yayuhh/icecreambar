const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');

const expect = Code.expect;
const lab = exports.lab = Lab.script();

let server;

const ROLLBAR_TOKEN = '58b67946b9af48e8ad07595afe9d63b2';

lab.experiment('log', function () {

  async function register() {
    
    await server.register({
      plugin: require('../index.js'),
      options:{
        'accessToken': ROLLBAR_TOKEN,
      }
    });
  };

  lab.beforeEach(async () => {
    server = new Hapi.Server();
    await server.start();
  });

  lab.test('handleError is called when server.log("rollbarError")', async () => {
    
    await register();

    server.plugins.icecreambar.handleError = require('sinon').spy();
    server.log(['rollbarError'], 'foooo');

    expect(server.plugins.icecreambar.handleError.called).to.equal(true);
  });

  lab.test('reportMessage is called when server.log("rollbarError")', async () => {

    await register();

    server.plugins.icecreambar.reportMessage = require('sinon').spy();
    server.log(['rollbarMessage'], 'foooo');

    expect(server.plugins.icecreambar.reportMessage.called).to.equal(true);
  });
});
