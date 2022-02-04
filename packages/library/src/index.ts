export const version = '22.0.0-alpha3'
export const build = {
  //@ts-ignore Injected by webpack
  flavor: <string>BUILD_FLAVOR,
  //@ts-ignore Injected by webpack
  commit: <string>BUILD_COMMIT,
}

export * as core from './core'
export * as data from './data'

export * as flow from './flow'
export * as html from './html'
export * as canvas from './canvas'

export * as plugins from './plugins'

export * as util from './util'
