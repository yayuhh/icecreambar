const Hapi = require('hapi');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');

const expect = Code.expect;
const lab = exports.lab = Lab.script();

let server;

const ROLLBAR_TOKEN = '58b67946b9af48e8ad07595afe9d63b2';

lab.experiment('server', function () {

  async function register(fn, options = {}) {
    
    await server.register({
      plugin: require('../index.js'),
      options: Object.assign(options, {
        'accessToken': ROLLBAR_TOKEN,
      })
    });

    server.plugins.icecreambar.handleErrorWithPayloadData = require('sinon').spy();

    server.route({
      method: 'get',
      path: '/foo',
      handler: fn
    });

    await server.start();

    await server.inject('/foo');
  };

  lab.beforeEach(function() {

    server = new Hapi.Server();

    // suppress internal output
    console.error = function(){};
  });


  lab.test('can successfully register the plugin', async () => {
    await register(() => {});
  });

  lab.test('handleErrorWithPayloadData is called when a res is 5xx', async () => {
  
    const fn = () => Boom.badImplementation();
    await register(fn);

    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
  });

  lab.test('handleErrorWithPayloadData is called when a response is 4xx', async () => {

    const fn = () => Boom.badRequest();
    await register(fn);

    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
  });

  lab.test('handleErrorWithPayloadData is not called when the handler response is not an error', async () => {

    const fn = (reply, h) => h;
    await register(fn);
    
    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(false);
  });

  lab.test('handleError is not called when the response status is ignored',  async () => {

    const fn = () => Boom.notFound();
    await register(fn, { 
      omittedResponseCodes: [404]
    });
    
    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(false);
  });

  lab.test('request.log reports an error when it includes the rollbarError tag', async () => {

    const fn = (request, h) =>{
      request.log(['rollbarError'], 'ruh-roh!');
      return h;
    };
    await register(fn);

    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
  });

  lab.test('request.log reports an error when it includes the rollbarError tag and no data', async () => {

    const fn = (request, h) =>{
      request.log(['rollbarError']);
      return h;
    };
    await register(fn);

    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
  });

  lab.test('request.log reports a message when it includes the rollbarMessage tag', async () => {

    await server.register({
      plugin: require('../index.js'),
      options: {
        'accessToken': ROLLBAR_TOKEN,
      }
    });

    server.plugins.icecreambar.reportMessage = require('sinon').spy();

    server.route({
      method: 'get',
      path: '/foo',
      handler: (request, h) =>{
        request.log(['rollbarMessage'], 'ruh-roh!');
        return h;
      }
    });

    await server.start();

    await server.inject('/foo');

    expect(server.plugins.icecreambar.reportMessage.called).to.equal(true);
  });

  lab.test('request.log reports an error with custom data when it includes custom data', async () => {

    const fn = (request, h) =>{
      const err = Boom.create(501);
      err.data = 'arbitrary stuff';
      return err;
    };
    await register(fn);

    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(true);
    expect(server.plugins.icecreambar.handleErrorWithPayloadData.args[0][1].custom).to.exist;
  });

  lab.test('ignore 4xx responses that are not errors', async () => {
    
    const fn = (request, h) => h.response().code(403);
    await register(fn);

    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(false);
  });

  lab.test('ignore 5xx responses that are not errors', async () => {

    const fn = (request, h) => h.response().code(501);
    await register(fn);
    
    expect(server.plugins.icecreambar.handleErrorWithPayloadData.called).to.equal(false);
  });

  lab.test('correct rollbar_person property is sent to rollbar', async () => {

    const fn = (request, h) =>{

      request.auth.credentials = {
        'id' : 42,
        'email' : 'test@email.com',
        'username' : 'test'
      }

      const err = Boom.create(501);
      err.data = 'arbitrary stuff';

      return err;
    };

    await register(fn, { personTracking : {} });

    expect(server.plugins.icecreambar.handleErrorWithPayloadData.args[0][2].rollbar_person).to.equal({
      'id' : 42,
      'email' : 'test@email.com',
      'username' : 'test'
    });
  });
});
