/* config-overrides.js */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ['html', 'css', 'javascript']
      })
    )
    return config
  },
  jest: (config) => {
    config.transformIgnorePatterns = ["../../node_modules/monaco-editor"]
    return config
  },
}
