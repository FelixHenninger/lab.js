// Karma configuration

module.exports = (config) => {
  config.set({
    // Root / base path
    basePath: '../../../../',

    // Frameworks to use
    // (see https://npmjs.org/browse/keyword/karma-adapter)
    frameworks: ['requirejs', 'chai', 'sinon', 'mocha'],

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

    // Preprocess test files
    // (c.f. https://npmjs.org/browse/keyword/karma-preprocessor)
    preprocessors: {
    },

    // Test results reporter to use
    // (see https://npmjs.org/browse/keyword/karma-reporter for more)
    reporters: ['dots'],

    // Enable colors in the output (reporters and logs)
    colors: true,

    // Log level
    // (DISABLE || ERROR || WARN || INFO || DEBUG)
    logLevel: config.LOG_INFO,

    // Disable watching file
    autoWatch: false,

    // Browsers to test
    // (see https://npmjs.org/browse/keyword/karma-launcher for more)
    browsers: ['ChromeHeadless'],

    // Continuous integration mode (quit after run)
    singleRun: true,

    // Concurrency level (browsers tested in parallel)
    concurrency: 5
  })
}
