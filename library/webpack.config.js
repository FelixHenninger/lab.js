const path = require('path')
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

// Minimize output unless development mode
// is explicitly specified
const minimize = !process.argv.find(x => x === '-d')

// Set output file name
let outputFilename

if (minimize) {
  outputFilename = 'lab.min.js'
} else {
  outputFilename = 'lab.dev.js'
}

const banner = [
  'lab.js -- Building blocks for online experiments',
  '(c) 2015- Felix Henninger',
].join('\n')

const config = {
  entry: {
    js: [ './src/index' ],
  },
  module: {
    loaders: [{
      loader: 'babel-loader',
      test: /\.js$/,
      include: path.join(__dirname, 'src'),
      query: {
        presets: [
          ['es2015', { 'modules': false }],
          'es2016',
          'es2017'
        ],
        plugins: [
          'transform-runtime',
          'transform-object-rest-spread',
          'lodash',
        ],
      },
    }],
  },
  devtool: minimize ? 'source-map' : 'inline-source-map',
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
if (minimize) {
  // TODO: Can we generate this
  // automatically from the library?
  const reservedTerms = [
    // Components
    'Component', 'Dummy',
    'Screen', 'Form', 'Frame',
    'Sequence', 'Loop', 'Parallel',
    // Plugins
    'Debug', 'Logger', 'Transmit',
  ]
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
}

module.exports = config
