// Karma configuration

const customLaunchers = {
  sl_chrome_latest: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'latest',
    platform: 'Windows 10',
  },
  /* Chrome beta disabled temporarily, crashes because of missing chromedriver
  sl_chrome_beta: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'beta',
    platform: 'Windows 10',
  },
  */
  sl_firefox_latest: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest',
    platform: 'Windows 10',
  },
  /* Firefox beta is very buggy on SL
  sl_firefox_beta: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'beta',
    platform: 'Windows 10',
  }, */
  sl_edge_latest: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    version: 'latest',
    platform: 'Windows 10',
  },
  // Edge beta is not available (yet?)
  sl_safari_latest: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.12',
    version: 'latest',
  },
  // Safari beta is not available (yet?)
  // Mobile browsers -----------------------------------------------------------
  sl_android_6: {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platform: 'Android',
    version: '6.0',
    deviceName: 'Android Emulator',
    deviceOrientation: 'portrait'
  },
  sl_android_7: {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platform: 'Android',
    version: '7.1',
    deviceName: 'Android GoogleAPI Emulator',
    deviceOrientation: 'portrait'
  },
  sl_ios_11: {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS',
    version: '11.3',
    deviceName: 'iPhone X Simulator',
    deviceOrientation: 'portrait'
  },
  sl_ios_12: {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS',
    version: '12.0',
    deviceName: 'iPhone XS Simulator',
    deviceOrientation: 'portrait'
  },
}

module.exports = (config) => {
  config.set({
    // Root / base path
    basePath: '../../../../',

    // Frameworks to use
    // (see https://npmjs.org/browse/keyword/karma-adapter)
    frameworks: ['mocha', 'requirejs', 'chai', 'sinon'],

    // Files or patterns to load in the browser
    files: [
      'packages/library/test/_karma/bootstrap.js',
      { pattern: 'packages/library/test/static/*.*', included: false },
      { pattern: 'packages/library/dist/lab.js', included: false },
      { pattern: 'packages/library/node_modules/lodash/lodash.min.js', included: false },
      { pattern: 'packages/library/test/**/*.js', included: false },
    ],

    // List of files to exclude
    exclude: [
      'packages/library/test/_karma/[^bootstrap].js',
    ],

    proxies: {
      "/static/": "/base/packages/library/test/static/"
    },

    // Local web server port
    port: 9876,

    plugins: [
      'karma-babel-preprocessor',
      'karma-chai',
      'karma-mocha',
      'karma-requirejs',
      'karma-sauce-launcher',
      'karma-sinon',
    ],

    // Preprocess test files
    // (c.f. https://npmjs.org/browse/keyword/karma-preprocessor)
    preprocessors: {
      'test/**/*.js': ['babel'],
    },

    babelPreprocessor: {
      options: {
        presets: ['env'],
        sourceMap: 'inline',
        plugins: [
          'transform-object-rest-spread',
        ],
      },
      filename: file => file.originalPath.replace(/\.js$/, '.es5.js'),
      sourceFileName: file => file.originalPath,
    },

    // Test results reporter to use
    // (see https://npmjs.org/browse/keyword/karma-reporter for more)
    reporters: ['dots', 'saucelabs'],

    // Enable colors in the output (reporters and logs)
    colors: true,

    // Log level
    // (DISABLE || ERROR || WARN || INFO || DEBUG)
    logLevel: config.LOG_INFO,

    // Disable watching file
    autoWatch: false,

    // SL-specific configuration
    sauceLabs: {
      testName: 'lab.js browser compatibility tests',
      connectOptions: {
        port: 5757,
        logfile: 'sauce_connect.log'
      },
    },

    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),

    // Increase timeouts to prevent disconnects (w/ defaults)
    browserDisconnectTimeout: 10000, // (2000)
    browserDisconnectTolerance: 1, // (0)
    browserNoActivityTimeout: 4*60*1000, // (10000)
    captureTimeout: 4*60*1000, // (60000)

    // Continuous integration mode (quit after run)
    singleRun: true,

    // Concurrency level (browsers tested in parallel)
    concurrency: 5,
  })
}
