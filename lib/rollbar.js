var rollbar = require('rollbar');

module.exports = function(accessToken) {
  rollbar.init(accessToken);
  return rollbar;
};
