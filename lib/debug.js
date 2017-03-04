var Debug = require('debug');
var packageJson = require('../package.json');

module.exports = function(tag) {
  return Debug(`${packageJson.name}:${tag}`);
};

