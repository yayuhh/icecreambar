const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Plugin = require('../index');
const Sinon = require('sinon');

const expect = Code.expect;
const lab = exports.lab = Lab.script();

let server;

const ROLLBAR_TOKEN = '58b67946b9af48e8ad07595afe9d63b2';

lab.experiment('options', function () {

  async function register(options = {}) {
    
    await server.register({
      plugin: Plugin,
      options: Object.assign(options, {
        'accessToken': ROLLBAR_TOKEN,
      })
    });
  };

  lab.beforeEach(async () => {
    Plugin.Rollbar = Sinon.spy();

    server = new Hapi.Server();
    await server.start();
  });

  lab.test('specified environment is passed to rollbar', async () => {
    
    await register({ environment: 'foo' });

    expect(Plugin.Rollbar.firstCall.args[0].environment).to.equal('foo');
  });

  lab.test('process.env.NODE_ENV is used as environment when none specified', async () => {
    
    await register();

    expect(Plugin.Rollbar.firstCall.args[0].environment).to.equal(process.env.NODE_ENV);
  });

  lab.test('`development` is used as environment when none specified and NODE_ENV is unset', async () => {
  
    const originalNodeEnv = process.env.NODE_ENV;
    delete process.env.NODE_ENV;

    await register();

    expect(Plugin.Rollbar.firstCall.args[0].environment).to.equal('development');
    process.env.NODE_ENV = originalNodeEnv;
  });

  lab.test('personTracking  is optional', async () => {

    await register();

    expect(Plugin.Rollbar.firstCall.args[0].personTracking).to.be.undefined();
  });

  lab.test('personTracking options without specifying user properties uses defaults', async () => {
    
    await register({ personTracking: {} });

    expect(Plugin.Rollbar.firstCall.args[0].personTracking).to.equal({
      'email': 'email',
      'id': 'id',
      'username': 'username'
    });
  });

  lab.test('personTracking options with `true` uses defaults', async () => {
    
    await register({ personTracking: true });

    expect(Plugin.Rollbar.firstCall.args[0].personTracking).to.equal({
      'email': 'email',
      'id': 'id',
      'username': 'username'
    });
  });

  lab.test('personTracking options with specifying user properties uses specified properties', async () => {
    
    await register({ 
      personTracking: {
      'email': 'email_address',
      'id': 'identifier',
      'username': 'user_name'
    }});

    expect(Plugin.Rollbar.firstCall.args[0].personTracking).to.equal({
      'email': 'email_address',
      'id': 'identifier',
      'username': 'user_name'
    });
  });

});
