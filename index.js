exports.Rollbar = require('./lib/rollbar');

exports.register = function (server, options, next) {

  options.environment = options.environment || process.env.NODE_ENV || 'development';

  const rollbar = new exports.Rollbar(options.accessToken, options);
  server.plugins.icecreambar =  rollbar;
  server.plugins.icecreambar['default'] = rollbar;

  // events logged with server.log()
  server.on('log', function (event, tags) {

    // if this ERROR is intended for Rollbar
    if (tags.rollbarError) {
      rollbar.handleError(event);
    }

    // if this MESSAGE is intended for Rollbar
    if (tags.rollbarMessage) {
      rollbar.reportMessage(event, 'info');
    }
  });

  // events logged with request.log()
  server.on('request', function (request, event, tags) {

    // if this ERROR is intended for Rollbar
    if (tags.rollbarError) {
      let custom = event.data ? event.data : undefined;

      rollbar.handleErrorWithPayloadData(
        event,
        { level: 'error', custom },
        exports.relevantProperties(request)
      );
    }

    // if this MESSAGE is intended for Rollbar
    if (tags.rollbarMessage) {
      rollbar.reportMessage(event, 'info', exports.relevantProperties(request));
    }
  });

  server.ext('onPreResponse', function (request, reply) {
    const response = request.response;
    const isBoom = response.isBoom;
    const isError = response instanceof Error;
    const status = isBoom ? response.output.statusCode : response.statusCode;
    const omittedResponseCodes = options.omittedResponseCodes || [];
    const shouldHandleError = isError && omittedResponseCodes.indexOf(status) === -1;

    if (shouldHandleError) {
      let custom = response.data ? response.data : undefined;

      // submit error
      rollbar.handleErrorWithPayloadData(
        response,
        { level: 'error', custom },
        exports.relevantProperties(request)
      );
    }

    reply.continue();
  });

  next();
};

exports.relevantProperties = function(request) {
  return {
    headers: request.headers,
    url: request.path,
    method: request.method,
    body: request.payload
  };
};

exports.register.attributes = {
  pkg: require('./package.json'),
  multiple: false
};
