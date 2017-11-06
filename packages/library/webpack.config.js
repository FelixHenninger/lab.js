const path = require('path')
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

// Non-minified development version
const development = process.argv.includes('-d')

// Add coverage information if requested
const coverage = process.env.NODE_ENV === 'coverage'

// Set output file name
let outputFilename

if (coverage) {
  outputFilename = 'lab.coverage.js'
} else if (development) {
  outputFilename = 'lab.dev.js'
} else {
  outputFilename = 'lab.js'
}

const banner = [
  'lab.js -- Building blocks for online experiments',
  '(c) 2015- Felix Henninger',
].join('\n')

const config = {
  entry: {
    js: [ 'babel-polyfill', './src/index.js' ],
  },
  module: {
    loaders: [{
      loader: 'babel-loader',
      test: /\.js$/,
      include: path.join(__dirname, 'src'),
      query: {
        presets: [
          ['env', { modules: false }],
        ],
        plugins: [
          'transform-runtime',
          'transform-object-rest-spread',
          'lodash',
        ],
      },
    }],
    // NOTE: This fixes a webpack issue (#5135)
    // and should be revisited at a later date
    strictThisContextOnImports: true,
  },
  devtool: development ? 'inline-source-map' : 'source-map',
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
if (!development) {
  // TODO: Can we generate this
  // automatically from the library?
  const reservedTerms = [
    // Components
    'Component', 'Dummy',
    'Screen', 'Form', 'Frame',
    'Sequence', 'Loop', 'Parallel',
    // Plugins
    'Debug', 'Logger', 'Metadata', 'Transmit',
    // Utilities
    'Random', 'fromObject',
  ]
  // Minify code
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      reserve: reservedTerms,
      compress: {
        warnings: false,
      },
      mangle: {
        except: reservedTerms,
      },
      minimize: true,
      sourceMap: true,
    }),
    // eslint-disable-next-line comma-dangle
    new webpack.optimize.OccurrenceOrderPlugin()
  )
} else if (coverage) {
  // Add code coverage instrumentation
  config.module.loaders[0].query.plugins.push('istanbul')
}

module.exports = config
