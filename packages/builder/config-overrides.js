/* config-overrides.js */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ['html', 'css', 'javascript']
      })
    )
    config.resolve.fallback = config.resolve.fallback ?? {}
    config.resolve.fallback.buffer = require.resolve('buffer/')

    return config
  },
  // NOTE: This pulls in babel-jest as a dependency;
  // remove the dependency when reverting the custom config
  jest: (config) => {
    config.transformIgnorePatterns = ["../../node_modules/monaco-editor"]
    return config
  },
}
