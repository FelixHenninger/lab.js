import { without } from 'lodash'
import { Component } from './component'

export type Plugin = {
  handle: (context: Component, event: string, data?: any) => Promise<void>
}

export class PluginAPI {
  plugins: Array<Plugin>
  context: Component

  constructor(context: Component, plugins: Array<Plugin> = []) {
    this.context = context
    this.plugins = plugins

    // Initialize existing plugins
    this.plugins.forEach(p => p.handle(this.context, 'plugin:init'))

    // Setup event handlers
    this.handle = this.handle.bind(this)
    this.context.internals.emitter.on('*', this.handle)
  }

  add(plugin: Plugin) {
    this.plugins.push(plugin)
    plugin.handle(this.context, 'plugin:init')
  }

  remove(plugin: Plugin) {
    plugin.handle(this.context, 'plugin:removal')
    this.plugins = without(this.plugins, plugin)
  }

  async handle(event: string, data: any) {
    await Promise.all(
      this.plugins.map(p => p.handle(this.context, event, data)),
    )
  }
}
