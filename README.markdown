![logo](https://raw.githubusercontent.com/yayuhh/icecreambar/master/logo.png)

# ice cream bar [![Build Status](https://travis-ci.org/yayuhh/icecreambar.svg?branch=master)](https://travis-ci.org/yayuhh/icecreambar)
hapi plugin for rollbar error logging

**icecreambar** can be registered multiple times -- this is handy if you write more than one plugin and each one wants to require/configure it's own instance of the plugin. This may happen when working on large teams and different teams are resonsible for monitoring different components.

Let's start with the minimal use case, though:

## [minimal] usage
minimal usage means only registering icecreambar once in your server; this means between your server and all of your plugins, this plugin should only be registered once. See below for `multiple` usage.

```javascript
// http://hapijs.com/api#server
var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
  method: 'get',
  path: '/foo',
  handler: function(request, reply) {

    // implicitly trigger an error to be recorded to Rollbar via `rollbar.handleError`:
    reply(new Error('ruh-roh!'));

    // access the underlying rollbar library directly
    var rollbar = server.plugins.icecreambar.default;

    // translate hapijs version of `request` to what rollbar expects
    var rollbarRequest = server.plugins.icecreambar.decorateRequest(request);

    // explicitly log an error to Rollbar via `rollbar.handleError`:
    rollbar.handleError(error, rollbarRequest);

    // explicitly log a message to Rollbar via `rollbar.recordMessage`:
    rollbar.reportMessage('Interesting thing just happened', 'info', rollbarRequest);

    // implicitly log [stuff] to rollbar's recordMessage
    // leveraging hapi's built in logging system
    // http://hapijs.com/api#serverlogtags-data-timestamp
    server.log(['rollbarMessage'], 'Interesting thing just happened');

    // implicitly log [stuff] to rollbar's handleError
    // leveraging hapi's built in logging system
    // http://hapijs.com/api#serverlogtags-data-timestamp
    server.log(['rollbarError'], new Error('ruh-roh'));

    // respond to the client
    reply('ok');
  }
});

server.register({
  register: require('icecreambar'),
  options: {
  'accessToken': '58b67946b9af48e8ad07595afe9d63b2'
  }
}, function (err) {

  if (err) { throw err; }
  server.start();
});
```

## [gratuitous] usage
gratuitous usage involves taking advantage of icecreambar's ability to be registered more than once.

```javascript
// http://hapijs.com/api#server
var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ port: 3000 });

server.register({
  register: require('icecreambar'),
  options: {
    'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
    'scope': 'sre',
    'relevantPaths': ['/uptime', '/auth']
  }
}, function (err) {

  if (err) { throw err; }
  server.start();
});
```
