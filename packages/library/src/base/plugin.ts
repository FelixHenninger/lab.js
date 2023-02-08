import { without } from 'lodash'
import { Component } from './component'

type PluginEvent = 'plugin:add' | 'plugin:remove'

export class Plugin<C extends Component = Component, E = string> {
  async handle(context: C, event: E | PluginEvent, data?: any) {}
}

export class PluginAPI<C extends Component = Component, E = string> {
  plugins: Array<Plugin<C, E>>
  #context: C

  constructor(context: C, plugins: Array<Plugin<C, E>> = []) {
    this.#context = context
    this.plugins = plugins

    // Initialize existing plugins
    this.plugins.forEach(p => p.handle(this.#context, 'plugin:add'))

    // Setup event handlers
    this.handle = this.handle.bind(this)
    this.#context.internals.emitter.on('*', this.handle)
  }

  add(plugin: Plugin<C, E>) {
    this.plugins.push(plugin)
    plugin.handle(this.#context, 'plugin:add')
  }

  remove(plugin: Plugin<C, E>) {
    plugin.handle(this.#context, 'plugin:remove')
    this.plugins = without(this.plugins, plugin)
  }

  async handle(event: E, data: any) {
    await Promise.all(
      this.plugins.map(p => p.handle(this.#context, event, data)),
    )
  }
}
