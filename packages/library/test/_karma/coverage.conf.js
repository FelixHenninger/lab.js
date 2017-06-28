// Karma configuration

module.exports = (config) => {
  config.set({
    // Root / base path
    basePath: '../../',

    // Frameworks to use
    // (see https://npmjs.org/browse/keyword/karma-adapter)
    frameworks: ['mocha', 'requirejs', 'chai', 'sinon'],

    // Files or patterns to load in the browser
    files: [
      'test/_karma/bootstrap.js',
      { pattern: 'dist/lab.coverage.js', included: false },
      { pattern: 'node_modules/lodash/lodash.min.js', included: false },
      { pattern: 'test/**/*.js', included: false },
    ],

    // list of files to exclude
    exclude: [
      'test/_karma/[^bootstrap].js',
    ],

    // Pass coverage option to client script
    client: {
      args: ['coverage'],
    },

    // Local web server port
    port: 9876,

    // Preprocess test files
    // (c.f. https://npmjs.org/browse/keyword/karma-preprocessor)
    preprocessors: {
    },

    // Test results reporter to use
    // (see https://npmjs.org/browse/keyword/karma-reporter for more)
    reporters: ['dots', 'coverage'],

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
    concurrency: 5,

    // Coverage reporting
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    }
  })
}
