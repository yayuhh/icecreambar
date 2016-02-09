var rollbar = require('rollbar');

module.exports = function(accessToken, options) {
  rollbar.init(accessToken, options);
  return rollbar;
};
