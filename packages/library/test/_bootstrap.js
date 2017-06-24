const TEST_REGEXP = /\/base\/test\/[^_][\w\d\.\_]+\.js$/i
const allTestFiles = []

// Gather test files
Object.keys(window.__karma__.files).forEach((file) => {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')
    allTestFiles.push(normalizedTestModule)
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  paths: {
    'lab': '/base/dist/lab'
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff mocha, as it is asynchronous
  callback: window.__karma__.start
})
