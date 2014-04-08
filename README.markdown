![logo](https://raw.githubusercontent.com/yayuhh/icecreambar/master/logo.png)

# ice cream bar
hapi plugin for rollbar error logging

## usage
```javascript
// npm install icecreambar rollbar hapi --save

var IceCreamBar = require('icecreambar');
var Hapi        = require('hapi');
var server      = new Hapi.Server('0.0.0.0', 3000);

var plugins = {
  'icecreambar': {
    'accessToken': '4815162342'
  }
};

server.pack.require(plugins, function(error) {
  if (error) throw err;
});
```
