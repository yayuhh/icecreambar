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
  server.plugins.icecreambar.decorateRequest = decorateRequest;
  server.plugins.icecreambar[scope || 'default'] = rollbar;

  server.on('request-error', function internalError (request, error) {

    if (!pathIsRelevant(request.route.path)) { return; }
    rollbar.handleError(error, decorateRequest(request));
  });

  server.on('log', rollbarLog(rollbar, scope));

  server.ext('onPreResponse', function (request, reply) {

    if (!pathIsRelevant(request.route.path)) { return reply.continue(); }

    const response = request.response;
    const isBoom = response.isBoom;

    if (isBoom) {
      const responseIsNot5xx = (response.output.statusCode < 500) || (response.output.statusCode > 599);

      if (responseIsNot5xx) {

        // submit error
        rollbar.handleError(response, decorateRequest(request), function(/*er1*/) {

          // log er1 to STDERR to bring attention to the rollbar failure
          // if (er1) { console.error(er1); }
        });
      }
    }

    reply.continue();
  });

  next();
};

exports.register.attributes = {
  pkg: require('./package.json'),
  multiple: true
};

function rollbarLog (rollbar, scope) {
  return function (event, tags) {

    // if this ERROR is intended for Rollbar
    if (tags.rollbarError) {
      if (scope && !tags[scope]) { return; /* ignore message */ }
      rollbar.handleError(event.err, decorateRequest(event.req));
      return;
    }

    // if this MESSAGE is intended for Rollbar
    if (tags.rollbarMessage) {
      if (scope && !tags[scope]) { return; /* ignore message */ }
      rollbar.reportMessage(event.msg, (event.level || 'info'), decorateRequest(event.req));
      return;
    }
  };
}
exports.rollbarLog = rollbarLog;


// translate rollbar's assumptions about Express
function decorateRequest (request) {

  if (!request) { return null; }

  const req = request.raw.req;

  req.socket = {
    encrypted: request.server.info.protocol === 'https'
  };

  req.connection = {
    remoteAddress: request.info.remoteAddress
  };

  return req;
}

exports.decorateRequest = decorateRequest;
