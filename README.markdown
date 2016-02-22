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
    server.log(['rollbarMessage'], 'Interesting thing just happened [somewhere in the server]');
    request.log(['rollbarMessage'], 'Interesting thing just happened [in the current request]');

    // implicitly log [stuff] to rollbar's handleError
    // leveraging hapi's built in logging system
    // http://hapijs.com/api#serverlogtags-data-timestamp
    server.log(['rollbarError'], new Error('ruh-roh, bad server'));
    request.log(['rollbarError'], new Error('ruh-roh, bad request'));

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
gratuitous usage involves taking advantage of icecreambar's ability to be registered more than once. this feature is particularly useful if you're composing a server out of many plugins and each of those plugins wishes to configure it's own rollbar instance.

```javascript
// http://hapijs.com/api#server
var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ port: 3000 });

server.register({
  register: require('icecreambar'),
  options: {
    'accessToken': '58b67946b9af48e8ad07595afe9d63b2',
    'scope': 'sre',                                    // namespace for this instance of rollbar
    'relevantPaths': ['/uptime', '/auth'],             // http path(s) that this instance shall report on
    'omittedResponseCodes': [401]                      // do not log 401 responses
  }
}, function (err) {

  if (err) { throw err; }
  server.start();

  server.route({
    method: 'get',
    path: '/uptime',
    handler: function(request, reply) {

      reply(new Error('ruh-roh!'));                 // reported by server.app.icecreambar.sre

      var rollbar = server.plugins.icecreambar.sre; // access the appropriate rollbar library directly

      request.log(['rollbarMessage','sre'], 'This message is reported via server.app.icecreambar.sre');
      // that log will _also_ be reported by server.app.icecreambar.default
      // ...if any rollbar client is registered in your project without a defined scope
    }
  });
});
```

## uncaught exceptions
this feature should only be registered on the project level; i.e., do not enable it in your plugin(s), as the result could be unexpeted error reporting and/or duplicated errors. to leverage this feature, either require the [rollbar](https://rollbar.com/docs/notifier/node_rollbar/#uncaught-exceptions) module directly or access a registered instance (e.g. `server.plugins.icecreambar.default`). either way, it'll look something like this:

```js
var rollbar = require('rollbar'); // this requires `rollbar` is installed to your `node_modules` folder
var rollbar = server.plugins.icecreambar.default; // this requires that you've registered `icecreambar` without a scope, or explicitly named the scope `default`. you can substitute `default` for any registered scope.

rollbar.handleUncaughtExceptions('POST_SERVER_ITEM_ACCESS_TOKEN', { exitOnUncaughtException: true });
```
