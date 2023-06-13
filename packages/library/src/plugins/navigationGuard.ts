import { Component } from '../core/component'
import { Plugin } from '../base/plugin'

const unloadHandler = (e: Event) => {
  const warning = 'Closing this window will abort the study. Are you sure?'
  //@ts-ignore I know this shouldn't work, but browsers
  // are a lot more messy than typescript assumes
  // (see also the Download plugin)
  e.returnValue = warning
  return warning
}

export default class NavigationGuard implements Plugin {
  async handle(_: Component, event: string) {
    if (event === 'prepare') {
      window.addEventListener('beforeunload', unloadHandler)
    } else if (event === 'end') {
      window.removeEventListener('beforeunload', unloadHandler)
    }
  }
}
