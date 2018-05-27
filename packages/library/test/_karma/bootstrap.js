const TEST_REGEXP = /\/base\/test\/[^_][\w\d\.\_]+\.js$/i
const allTestFiles = []

// eslint-disable-next-line import/no-amd
require(['/base/node_modules/lodash/lodash.min'], function(_) {
  // Gather test files
  _.keys(window.__karma__.files).forEach((file) => {
    if (TEST_REGEXP.test(file)) {
      // Normalize paths to RequireJS module names
      var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')
      allTestFiles.push(normalizedTestModule)
    }
  })

  const libraryFlavor = (window.__karma__.config.args || [])
    .filter(arg => _.startsWith(arg, 'flavor'))
    .map(flavor => flavor.split('-')[1])[0] || 'default'

  const libraryPath = {
    coverage: '/base/dist/lab.coverage',
    legacy: '/base/dist/lab.legacy',
  }[libraryFlavor] || '/base/dist/lab'

  require.config({
    // Karma serves files under /base, which is
    // the basePath from your config file
    baseUrl: '/base',

    paths: {
      'lab': libraryPath,
      '_': '/base/node_modules/lodash/lodash.min'
    },

    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff mocha, as it is asynchronous
    callback: window.__karma__.start
  })
})

