const path = require('path')
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env, argv) => {
  const mode = argv.mode

  // Set output file name
  const outputFilename = {
    'coverage': 'lab.coverage.js',
    'development': 'lab.dev.js',
  }[mode] || 'lab.js'

  const banner = [
    'lab.js -- Building blocks for online experiments',
    '(c) 2015- Felix Henninger',
  ].join('\n')

  const config = {
    entry: {
      js: [ './src/index.js' ],
    },
    module: {
      rules: [{
        loader: 'babel-loader',
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        query: {
          presets: [
            ['env', {
              modules: false,
              useBuiltIns: true,
            }],
          ],
          plugins: [
            'transform-object-rest-spread',
            'lodash',
            ['fast-async', {
              runtimePattern: './src/index.js'
            }]
          ],
        },
      }],
    },
    devtool: mode === 'development' ? 'inline-source-map' : 'source-map',
    plugins: [
      new LodashModuleReplacementPlugin(),
      new webpack.BannerPlugin({
        banner,
        exclude: ['lab.vendor.js'],
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
    // Minify code
    const reservedTerms = [
      // Components
      'Component', 'Dummy',
      'Screen', 'Form', 'Frame',
      'Sequence', 'Loop', 'Parallel',
      // Plugins
      'Debug', 'Download', 'Logger', 'Metadata', 'Transmit',
      // Utilities
      'Random', 'fromObject',
    ]

    config.optimization = {
      minimizer: [
        new UglifyJsPlugin({
          sourceMap: true,
          uglifyOptions: {
            compress: {
              inline: false,
            },
            reserve: reservedTerms,
            mangle: {
              reserved: reservedTerms,
            },
          },
        }),
      ],
    };
    config.plugins.push(
      // eslint-disable-next-line comma-dangle
      new webpack.optimize.OccurrenceOrderPlugin()
    )
    if (mode === 'analysis') {
      config.plugins.push(
        new BundleAnalyzerPlugin()
      )
    }
  } else if (mode === 'coverage') {
    // Add code coverage instrumentation
    config.module.loaders[0].query.plugins.push('istanbul')
  }

  return config
}
