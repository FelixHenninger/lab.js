const path = require('path')
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const TerserPlugin = require('terser-webpack-plugin')
const shell = require('shelljs')

// Minify code
const reservedTerms = [
  // Components
  'Component', 'Dummy',
  'Screen', 'Page', 'Form', 'Frame',
  'Sequence', 'Loop', 'Parallel',
  // Plugins
  'Debug', 'Download', 'Logger', 'Metadata', 'Transmit',
  // Utilities
  'Random', 'fromObject',
]

module.exports = (env, argv) => {
  const mode = argv.mode
  const target = process.env.NODE_ENV || mode

  // Set output file name
  const outputFilename = {
    'coverage': 'lab.coverage.js',
    'development': 'lab.dev.js',
  }[target] || 'lab.js'

  const banner = [
    'lab.js -- Building blocks for online experiments',
    '(c) 2015- Felix Henninger',
  ].join('\n')

  const config = {
    mode: mode === 'development' ? mode : 'production',
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [{
        loader: 'ts-loader',
        test: /\.[jt]s$/,
        include: path.join(__dirname, 'src'),
      }],
    },
    devtool: mode === 'development' ? 'inline-source-map' : 'source-map',
    plugins: [
      new LodashModuleReplacementPlugin(),
      new webpack.BannerPlugin({ banner }),
      new webpack.DefinePlugin({
        BUILD_FLAVOR: JSON.stringify(target),
        BUILD_COMMIT: JSON.stringify(
          shell.exec('git rev-list -1 HEAD -- .', { silent: true }).trim()
        ),
      }),
    ],
    output: {
      filename: outputFilename,
      path: path.join(__dirname, '/dist'),
      library: 'lab',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
  }

  // Optimize/minimize output
  // by including the corresponding plugins
  if (mode !== 'development') {
    config.optimization = config.optimization || {}
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: reservedTerms,
          },
        },
      })
    ]

    if (target === 'analysis') {
      config.plugins.push(
        new BundleAnalyzerPlugin()
      )
    }
  } else if (target === 'coverage') {
    // Add code coverage instrumentation
    config.module.rules[0].query.plugins.push('istanbul')
  }

  return config
}
