![icecream-bar](https://github.com/yayuhh/icecream-rollbar/blob/master/logo.png)

# icecream-rollbar

## usage
### example
```javascript
// npm install icecream-rollbar rollbar hapi --save

var IceCreamBar = require('icecream-rollbar');
var Hapi        = require('hapi');
var server      = new Hapi.Server('0.0.0.0', 3000);

var plugins = {
  'icecream-rollbar': {
    'accessToken': '4815162342'
  }
};

server.pack.require(plugins, function(error) {
  if (error) throw err;
});
```
