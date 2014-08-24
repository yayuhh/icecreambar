var Rollbar     = require('rollbar');
var Hapi        = require('hapi');
var server      = new Hapi.Server('0.0.0.0', 3000);
var test        = require('tape');

var icb = {
  plugin: require('../index.js'),
  options: {
    'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
  }
};

server.route({
  method: 'GET', path: '/',
  handler: function(request,reply) {
    reply().code(204);
  }
});


test('hapi server successfully loads the plugin', function (t) {

  t.plan(1);

  server.pack.register(icb, function(error) {
    t.error(error, 'plugin successfully initialized');
  });
});


test('server does not crash on request', function (t) {

  t.plan(1);

  server.inject({
    method:'get', url: '/'
  }, function(res) {
    t.equal(204, res.statusCode, 'received 204 status code');
    Rollbar.shutdown();
  });
})
