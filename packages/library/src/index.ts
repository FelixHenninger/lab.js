// Load standard library polyfill
import 'core-js/stable'

export const version = '20.1.1'
export const build = {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'BUILD_FLAVOR'.
  flavor: BUILD_FLAVOR,
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'BUILD_COMMIT'.
  commit: BUILD_COMMIT,
}

export * as core from './core'

export * as canvas from './canvas'

export * as html from './html'

export * as flow from './flow'

export * as data from './data'

export * as util from './util'
