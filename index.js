var Rollbar = require('./lib/rollbar');

exports.register = function(plugin, options, next) {
  var rollbar = Rollbar(options.accessToken);

  plugin.ext('onPreResponse', function (request, reply) {

    var response = request.response;
    
    if (response.isBoom) {
      rollbar(response, function(error) { reply(); });
    } else {
      reply();
    }
  });

  next();
}
