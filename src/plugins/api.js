import { without } from 'lodash'

export default class PluginAPI {
  constructor(context) {
    this.plugins = []
    this.context = context
  }

  add(plugin) {
    this.plugins.push(plugin)
    plugin.handle(this.context, 'plugin:init')
  }

  remove(plugin) {
    plugin.handle(this.context, 'plugin:removal')
    this.plugins = without(this.plugins, plugin)
  }

  trigger(event, ...args) {
    return Promise.all(this.plugins.map(
      p => p.handle(this.context, event, ...args)
    ))
  }
}
