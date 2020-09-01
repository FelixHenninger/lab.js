const path = require('path')
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const TerserPlugin = require('terser-webpack-plugin')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'shell'.
const shell = require('shelljs')

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

module.exports = (env: any, argv: any) => {
  const mode = argv.mode
  const target = process.env.NODE_ENV || mode

  // Set output file name
  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const outputFilename = {
    'coverage': 'lab.coverage.js',
    'development': 'lab.dev.js',
    'legacy': 'lab.legacy.js',
  }[target] || 'lab.js'

  const banner = [
    'lab.js -- Building blocks for online experiments',
    '(c) 2015- Felix Henninger',
  ].join('\n')

  // Define babel options
  const babelPresets = {
    legacy: {
      presets: [
        ['@babel/env', {
          // Module generation is handled by webpack
          modules: false,
          useBuiltIns: 'usage',
          corejs: 3,
        }],
      ],
      plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        'lodash',
        ['module:fast-async', {
          runtimePattern: './src/index.js'
        }],
      ],
    },
    default: {
      presets: [
        ['@babel/env', {
          targets: {
            browsers: [
              '> 2%',
              'last 2 versions', // 'not dead',
              'Firefox ESR',
              'not IE 11', 'not ExplorerMobile 11',
              'not OperaMini all', 'not OperaMobile < 37',
              'not Android < 60',
            ],
          },
          exclude: [
            'transform-async-to-generator',
            'transform-regenerator',
          ],
          // Module generation is handled by webpack
          modules: false,
          useBuiltIns: 'usage',
          corejs: 3,
        }],
      ],
      plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        'lodash',
      ],
    }
  }

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'includes' does not exist on type 'string... Remove this comment to see the full error message
  const babelOptions = Object.keys(babelPresets).includes(target)
    ? // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      babelPresets[target]
    : babelPresets.default

  const config = {
    entry: {
      js: target === 'legacy'
        ? ['whatwg-fetch', './src/index.js']
        : ['./src/index.js']
    },
    module: {
      rules: [{
        loader: 'babel-loader',
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        query: babelOptions,
      }],
    },
    devtool: mode === 'development' ? 'inline-source-map' : 'source-map',
    plugins: [
      new LodashModuleReplacementPlugin(),
      new webpack.BannerPlugin({
        banner,
        exclude: ['lab.vendor.js'],
      }),
      new webpack.DefinePlugin({
        BUILD_FLAVOR: JSON.stringify(target),
        BUILD_COMMIT: JSON.stringify(
          shell.exec('git rev-parse HEAD', { silent: true }).trim()
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'optimization' does not exist on type '{ ... Remove this comment to see the full error message
    config.optimization = config.optimization || {}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'optimization' does not exist on type '{ ... Remove this comment to see the full error message
    config.optimization.minimizer = [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          compress: {
            inline: false,
          },
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
