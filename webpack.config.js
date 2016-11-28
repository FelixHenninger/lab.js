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
    js: [
      'babel-regenerator-runtime',
      'es6-promise',
      'whatwg-fetch',
      './src/index',
    ], /* Temporarily disabled vendorizing (which does not play well with tree-shaking)
    vendor: [
      'lodash',
      'es6-promise',
      'whatwg-fetch',
    ] */
  },
  module: {
    loaders: [{
      loader: 'babel-loader',
      test: /\.js$/,
      include: path.join(__dirname, 'src'),
      query: {
        plugins: [
          'add-module-exports',
          'transform-regenerator',
          'transform-object-rest-spread',
          'lodash',
        ],
        presets: ['es2015'],
      },
    }],
  },
  plugins: [ /* Vendorizing support disabled, as above
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'lab.vendor.js',
      minChunks: Infinity
    }), */
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
    'Component', 'Dummy',
    'Screen', 'Form', 'Frame',
    'Sequence', 'Parallel',
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
    }),
    // eslint-disable-next-line comma-dangle
    new webpack.optimize.OccurrenceOrderPlugin()
  )
}

module.exports = config
