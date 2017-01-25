![logo](https://raw.githubusercontent.com/yayuhh/icecreambar/master/logo.png)

# ice cream bar [![Build Status](https://travis-ci.org/yayuhh/icecreambar.svg?branch=master)](https://travis-ci.org/yayuhh/icecreambar)
[hapi](https://hapijs.com) plugin for [Rollbar](https://rollbar.com) error logging

## quick and easy
```javascript
let accessToken = process.env.ROLLBAR_SERVER_ITEM_ACCESS_TOKEN;

server.register({
  register: require('icecreambar'),
  options: { accessToken }
}, function (err) {

  if (err) { throw err; }

  var rollbar = server.plugins.icecreambar;
  rollbar.handleUncaughtExceptions(accessToken, { exitOnUncaughtException: true });
});
```

## thorough example

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
    var rollbar = server.plugins.icecreambar;

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

    // access the underlying rollbar library directly
    var rollbar = server.plugins.icecreambar;
    // and then proceed to do what you'd like with it...

    // respond to the client
    reply('ok');
  }
});

let accessToken = process.env.ROLLBAR_SERVER_ITEM_ACCESS_TOKEN;

server.register({
  register: require('icecreambar'),
  options: { accessToken }
}, function (err) {

  if (err) { throw err; }
  server.start();
});
```

## person tracking
It is possible to track which users your errors are occurring with using the personTracking option. To enable this feature pass `personTracking: true` in your options boject. By default, this feature inspects `request.auth.credentials` for `id`, `email` and `username` parameters to send along to Rollbar. If your application uses different properties you can configure them via an object as follows;

```js

let accessToken = process.env.ROLLBAR_SERVER_ITEM_ACCESS_TOKEN;

server.register({
  register: require('icecreambar'),
  options: {
    accessToken,
    personTracking: {
      // Define your request.auth.credentials properties
      contact: 'email_address',
      whackyId: 'identifier',
      alias: 'user_name'
    }

    /* Defaults to {
      email: 'email_address',
      id: 'identifier',
      username: 'user_name'
    } */
    personTracking: true
  }
}, function (err) {

  if (err) { throw err; }
  server.start();
});

```


## uncaught exceptions
This feature should only be registered on the project level; i.e., do not enable it in your plugin(s), as the result could be unexpeted error reporting and/or duplicated errors. To leverage this feature, either require the [rollbar](https://rollbar.com/docs/notifier/node_rollbar/#uncaught-exceptions) module directly or access a registered instance (e.g. `server.plugins.icecreambar`). Either way, it'll look something like this:

```js
var rollbar = require('rollbar'); // this requires `rollbar` is installed to your `node_modules` folder
var rollbar = server.plugins.icecreambar; // this requires that you've registered `icecreambar` without a scope, or explicitly named the scope `default`. you can substitute `default` for any registered scope.

rollbar.handleUncaughtExceptions('POST_SERVER_ITEM_ACCESS_TOKEN', { exitOnUncaughtException: true });
```

## important
As of version 4.0.0 this module no longer supports `scopes` and can only be registered **once**. There is only one rollbar instance -- `server.plugins.icecreambar`. `icecreambar.default` continues to exist as a deprecated alias.
