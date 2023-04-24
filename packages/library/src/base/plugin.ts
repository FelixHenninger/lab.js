import { capitalize, without } from 'lodash'
import { Component } from './component'

type PluginEvent = 'pluginAdd' | 'pluginRemove'
type EventHandler<E extends string, C, P> = {
  [key in `on${Capitalize<E>}`]?: (context: C, ...params: P[]) => Promise<void>
}

//@ts-expect-error TS2359: No methods in common with EventHandler type
export class Plugin<C extends Component = Component, E extends string = string>
  implements EventHandler<PluginEvent, Component, any>
{
  async handle(context: C, event: E | PluginEvent, ...params: any[]) {
    //@ts-ignore Dynamic dispatch is too much for TS
    this[`on${capitalize(event)}`]?.call(this, context, ...params)
  }
}

export class PluginAPI<
  C extends Component = Component,
  E extends string = string,
> {
  plugins: Array<Plugin<C, E>>
  context: C

  constructor(context: C, plugins: Array<Plugin<C, E>> = []) {
    this.context = context
    this.plugins = plugins

    // Initialize existing plugins
    this.plugins.forEach(p => p.handle(this.context, 'pluginAdd'))

    // Setup event handlers
    this.handle = this.handle.bind(this)
    this.context.internals.emitter.on('*', this.handle)
  }

  add(plugin: Plugin<C, E>) {
    this.plugins.push(plugin)
    plugin.handle(this.context, 'pluginAdd')
  }

  remove(plugin: Plugin<C, E>) {
    plugin.handle(this.context, 'pluginRemove')
    this.plugins = without(this.plugins, plugin)
  }

  async handle(event: E, ...data: any[]) {
    await Promise.all(
      this.plugins.map(p => p.handle(this.context, event, ...data)),
    )
  }
}
