![logo](https://raw.githubusercontent.com/yayuhh/icecreambar/master/logo.png)

# ice cream bar [![Circle CI](https://circleci.com/gh/yayuhh/icecreambar.svg?style=svg)](https://circleci.com/gh/yayuhh/icecreambar)
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
