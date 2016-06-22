const path = require('path')
const webpack = require('webpack')

const banner = [
  'lab.js -- Building blocks for online experiments',
  '(c) 2015- Felix Henninger'
  ].join('\n');

module.exports = {
  devtool: 'source-map',
  debug: true,
  entry: {
    js: [
      './src/index'
    ],
    vendor: [
      'lodash'
    ]
  },
  module: {
    loaders: [{
      loader: 'babel-loader',
      test: /\.js$/,
      include: path.join(__dirname, 'src'),
      'query': {
        'plugins': ['add-module-exports'],
        'presets': ['es2015']
      }
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'lab.vendor.js',
      minChunks: Infinity
    }),
    new webpack.BannerPlugin(
      banner,
      {
        exclude: ['lab.vendor.js']
      }
    )
  ],
  output: {
    filename: 'lab.js',
    path: path.join(__dirname, '/dist'),
    library: 'lab',
    libraryTarget: "umd",
    umdNamedDefine: true
  },
}
