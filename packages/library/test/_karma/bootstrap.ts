const TEST_REGEXP = /\/base\/packages\/library\/test\/[^_][\w\d\.\_]+\.js$/i
const allTestFiles: any = []

// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
// eslint-disable-next-line import/no-amd
require(['/base/packages/library/node_modules/lodash/lodash.min'], function(_: any) {
  // Gather test files
  // @ts-expect-error ts-migrate(2339) FIXME: Property '__karma__' does not exist on type 'Windo... Remove this comment to see the full error message
  _.keys(window.__karma__.files).forEach((file: any) => {
    if (TEST_REGEXP.test(file)) {
      // Normalize paths to RequireJS module names
      var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')
      allTestFiles.push(normalizedTestModule)
    }
  })

  // @ts-expect-error ts-migrate(2339) FIXME: Property '__karma__' does not exist on type 'Windo... Remove this comment to see the full error message
  const libraryFlavor = (window.__karma__.config.args || [])
    .filter((arg: any) => _.startsWith(arg, 'flavor'))
    .map((flavor: any) => flavor.split('-')[1])[0] || 'default'

  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const libraryPath = {
    coverage: '/base/packages/library/dist/lab.coverage',
    legacy: '/base/packages/library/dist/lab.legacy',
  }[libraryFlavor] || '/base/packages/library/dist/lab'

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'config' does not exist on type 'NodeRequ... Remove this comment to see the full error message
  require.config({
    // Karma serves files under /base, which is
    // the basePath from your config file
    baseUrl: '/base',

    paths: {
      'lab': libraryFlavor === 'coverage'
        ? '/base/packages/library/dist/lab.coverage'
        : '/base/packages/library/dist/lab',
      '_': '/base/packages/library/node_modules/lodash/lodash.min'
    },

    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff mocha, as it is asynchronous
    // @ts-expect-error ts-migrate(2339) FIXME: Property '__karma__' does not exist on type 'Windo... Remove this comment to see the full error message
    callback: window.__karma__.start
  })
})

