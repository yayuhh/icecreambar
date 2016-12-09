exports.Rollbar = require('./lib/rollbar');

exports.register = function (server, options, next) {

  const scope = options.scope;
  const relevantPaths = options.relevantPaths;

  if (server.plugins.icecreambar && !scope) {
    // this plugin has already been registered at least once;
    // ensure that a scope has been set
    return next(new Error('`scope` param required (for distinguishing multiple registrations of icecreambar)'));
  }

  if (!relevantPaths) {
    // console.error('error', 'icecreambar registered without `relevantPaths` param.');
  }

  const pathIsRelevant = function (path) {
    if (!relevantPaths) { return true; }
    else { return relevantPaths.indexOf(path) > -1; }
  };

  options.environment = options.environment || process.env.NODE_ENV || 'development';

  const rollbar = new exports.Rollbar(options.accessToken, options);
  server.plugins.icecreambar = server.plugins.icecreambar || {};
  server.plugins.icecreambar[scope || 'default'] = rollbar;

  server.on('request-error', function internalError (request, error) {

    if (!pathIsRelevant(request.route.path)) { return; }
    rollbar.handleError(error, exports.relevantProperties(request));
  });

  // events logged with server.log()
  server.on('log', function (event, tags) {

    // if this ERROR is intended for Rollbar
    if (tags.rollbarError) {
      if (scope && !tags[scope]) { return; /* ignore message */ }
      rollbar.handleError(event);
    }

    // if this MESSAGE is intended for Rollbar
    if (tags.rollbarMessage) {
      if (scope && !tags[scope]) { return; /* ignore message */ }
      rollbar.reportMessage(event, 'info');
    }
  });

  // events logged with request.log()
  server.on('request', function (request, event, tags) {

    if (scope && !tags[scope]) { return; /* ignore message */ }

    // if this ERROR is intended for Rollbar
    if (event instanceof Error && tags.rollbarError) {
      let custom = event.data ? event.data : undefined;

      rollbar.handleErrorWithPayloadData(
        event,
        { level: 'error', custom },
        exports.relevantProperties(request)
      );
    }

    // if this MESSAGE is intended for Rollbar
    if (tags.rollbarMessage) {
      if (scope && !tags[scope]) { return; /* ignore message */ }
      rollbar.reportMessage(event, 'info', exports.relevantProperties(request));
    }
  });

  server.ext('onPreResponse', function (request, reply) {

    if (!pathIsRelevant(request.route.path)) { return reply.continue(); }

    const response = request.response;
    const isBoom = response.isBoom;

    if (isBoom) {
      // don't duplicate server.on('request-error', ...)
      const responseIsNot500 = response.output.statusCode !== 500;
      const omittedResponseCodes = options.omittedResponseCodes || [];
      const doNotIgnoreThisResponseCode = omittedResponseCodes.indexOf(response.output.statusCode) === -1;
      const shouldHandleError = responseIsNot500 && doNotIgnoreThisResponseCode;

      if (shouldHandleError) {
        let custom = response.data ? response.data : undefined;

        // submit error
        rollbar.handleErrorWithPayloadData(
          response,
          { level: 'error', custom },
          exports.relevantProperties(request)
        );
      }
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
  multiple: true
};
