var Rollbar = require('./lib/rollbar');

exports.register = function(plugin, options, next) {
  var rollbar = Rollbar(options.accessToken);

  plugin.ext('onPreResponse', function (request, reply) {

    var response = request.response;

    if (response.isBoom) {
      // deal with rollbar's assumptions about Express
      var req = request.raw.req;

      req.socket = {
        encrypted: request.server.info.protocol === 'https'
      };

      req.connection = {
        remoteAddress: request.info.remoteAddress
      };

      // submit error
      rollbar(response, req, function(error) { reply(); });
    } else {
      reply();
    }
  });

  next();
}
