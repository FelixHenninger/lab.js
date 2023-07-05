// Karma configuration

const customLaunchers = {
  sl_chrome_last: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'latest-1',
    platform: 'Windows 11',
  },
  sl_chrome_latest: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'latest',
    platform: 'Windows 11',
  },
  sl_chrome_beta: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'beta',
    platform: 'Windows 11',
  },
  sl_firefox_last: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest-1',
    platform: 'Windows 11',
  },
  sl_firefox_latest: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest',
    platform: 'Windows 11',
  },
  sl_firefox_beta: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'beta',
    platform: 'Windows 11',
  },
  sl_edge_last: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    version: 'latest-1',
    platform: 'Windows 11',
  },
  sl_edge_latest: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    version: 'latest',
    platform: 'Windows 11',
  },
  // Edge beta is not available (yet?)
  sl_safari_last: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'macOS 10.15',
    version: 'latest',
  },
  sl_safari_latest: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'macOS 11.00',
    version: 'latest',
  },
  // Safari beta is not available (yet?)
  // Mobile browsers -----------------------------------------------------------
  /*
  sl_android_8: {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platform: 'Android',
    version: '8.1',
    deviceName: 'Android GoogleAPI Emulator',
    deviceOrientation: 'portrait'
  },
  sl_android_9: {
    base: 'SauceLabs',
    appiumVersion: '1.9.1',
    browserName: 'Chrome',
    platform: 'Android',
    platformVersion: '9.0',
    deviceName: 'Android GoogleAPI Emulator',
    deviceOrientation: 'portrait'
  },
  sl_android_10: {
    base: 'SauceLabs',
    appiumVersion: '1.9.1',
    browserName: 'Chrome',
    platformName: 'Android',
    platformVersion: '10.0',
    deviceName: 'Android GoogleAPI Emulator',
    deviceOrientation: 'portrait'
  },
  */
  sl_ios_13: {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS',
    version: '13.4',
    deviceName: 'iPhone 11 Simulator',
    deviceOrientation: 'portrait'
  },
  sl_ios_14: {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS',
    version: '14.5',
    deviceName: 'iPhone 12 Simulator',
    deviceOrientation: 'portrait'
  },
}

module.exports = (config) => {
  config.set({
    // Root / base path
    basePath: '../../../../',

    // Frameworks to use
    // (see https://npmjs.org/browse/keyword/karma-adapter)
    frameworks: ['requirejs', 'chai', 'sinon',  'mocha'],

    // Files or patterns to load in the browser
    files: [
      'packages/library/test/_karma/bootstrap.js',
      { pattern: 'packages/library/test/static/*.*', included: false },
      { pattern: 'packages/library/dist/umd/lab.js', included: false },
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
      startConnect: false,
      tunnelIdentifier: process.env.TUNNEL_IDENTIFIER,
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
