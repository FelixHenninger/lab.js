import { without } from 'lodash'

export default class PluginAPI {
  context: any

  plugins: any

  constructor(context: any) {
    this.plugins = []
    this.context = context
  }

  add(plugin: any) {
    this.plugins.push(plugin)
    plugin.handle(this.context, 'plugin:init')
  }

  remove(plugin: any) {
    plugin.handle(this.context, 'plugin:removal')
    this.plugins = without(this.plugins, plugin)
  }

  trigger(event: any, ...args) {
    return Promise.all(
      this.plugins.map((p: any) => p.handle(this.context, event, ...args)),
    )
  }
}
