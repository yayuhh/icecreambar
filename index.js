var Rollbar = require('./lib/rollbar');

exports.register = function(plugin, options, next) {
  var rollbar = Rollbar(options.accessToken);

  plugin.ext('onPreResponse', function (request, reply) {

    var response = request.response;

    if (response.isBoom) {
      var errorObj = {
        message: response.message,
        body:    response.output.body
      };

      rollbar(errorObj, request.raw.req, null);
    }

    reply();

  });

  next();
}
