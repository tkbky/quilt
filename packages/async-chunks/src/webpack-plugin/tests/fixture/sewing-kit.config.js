/* eslint-env node */
const path = require('path');

module.exports = function createConfig(plugins, env) {
  return {
    name: 'fixture',
    plugins: [
      plugins.entry({
        main: path.resolve(__dirname, 'client/index.js'),
      }),
      plugins.experiments({
        reactLoadable: true,
      }),
    ],
  };
};
