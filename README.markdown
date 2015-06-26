![logo](https://raw.githubusercontent.com/yayuhh/icecreambar/master/logo.png)

# ice cream bar [![Build Status](https://travis-ci.org/yayuhh/icecreambar.svg?branch=master)](https://travis-ci.org/yayuhh/icecreambar)
hapi plugin for rollbar error logging

## usage
```javascript
// npm install yayuhh/icecreambar rollbar hapi --save

var Hapi   = require('hapi');
var server = new Hapi.Server('0.0.0.0', 3000);

var icb = {
  plugin: require('icecreambar'),
  options: {
    'accessToken': '4815162342'
  }
};

server.pack.register(plugins, function(error) {
  if (error) throw err;
});
```
