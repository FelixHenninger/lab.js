import { without } from 'lodash'
import { EventName } from '../core'
import { Component } from './component'

type PluginEvent = 'plugin:init' | 'plugin:removal'

export type Plugin<T extends Component = Component> = {
  handle: (
    context: T,
    event: EventName | PluginEvent,
    data?: any,
  ) => Promise<void>
}

export class PluginAPI<T extends Component> {
  plugins: Array<Plugin<T>>
  context: T

  constructor(context: T, plugins: Array<Plugin<T>> = []) {
    this.context = context
    this.plugins = plugins

    // Initialize existing plugins
    this.plugins.forEach(p => p.handle(this.context, 'plugin:init'))

    // Setup event handlers
    this.handle = this.handle.bind(this)
    this.context.internals.emitter.on('*', this.handle)
  }

  add(plugin: Plugin<T>) {
    this.plugins.push(plugin)
    plugin.handle(this.context, 'plugin:init')
  }

  remove(plugin: Plugin<T>) {
    plugin.handle(this.context, 'plugin:removal')
    this.plugins = without(this.plugins, plugin)
  }

  async handle(event: EventName, data: any) {
    await Promise.all(
      this.plugins.map(p => p.handle(this.context, event, data)),
    )
  }
}
