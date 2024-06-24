// This emitter is modelled after the mitt emitter
// by Jason Miller, see https://github.com/developit/mitt .
// Any mistakes, of course, are entirely my own.

import { Component } from "../component"

export type EventHandler = (...payload: any[]) => void
type WildCardEventHandler<T> = (event: T, ...payload: any[]) => void

// Currently registered handlers for an event
type EventHandlerList = Array<EventHandler>
type WildCardEventHandlerList<T> = Array<WildCardEventHandler<T>>

// Map events to their corresponding handlers
type PureEventHandlerMap<T> = Map<T, EventHandlerList>
type EventHandlerMap<T> = PureEventHandlerMap<T> & {
  '*'?: WildCardEventHandlerList<T>
}
// TODO: Is there an easier way to do this?

export type EmitterOptions = {
  debug?: boolean
  context?: object
}

// Event name splitter functions
const splitter = /(^|:)(\w)/gi
const getEventName = function (_m: string, _pre: string, eventName: string) {
  return eventName.toUpperCase()
}
const getMethodName = function (event: string) {
  return `on${event.replace(splitter, getEventName)}`
}

export class Emitter<T extends string = string> {
  component: Component
  options: EmitterOptions
  #context: object
  #hooks: EventHandlerMap<T>

  constructor(
    component: Component,
    options: EmitterOptions = { debug: false, context: undefined },
  ) {
    this.component = component
    this.options = options
    this.#hooks = new Map()
    this.#context = options.context ?? this
  }

  async trigger(event: T, ...payload: any[]) {
    if (this.options.debug) {
      console.info(`Caught ${event} on ${this.component.id}, data`, payload)
    }

    // Trigger local method, if available
    const methodName = getMethodName(event)
    const method = (this.#context as any)[methodName]
    if (method && typeof method === 'function') {
      await method.apply(this.#context, payload)
    }

    await this.emit(event, ...payload)
  }

  async emit(event: T, ...payload: any[]) {
    await Promise.all([
      ...(this.#hooks.get(event) ?? [])
        .slice()
        .map(handler => handler.apply(this.#context, payload)),
      // TODO: Can we do without the cast?
      ...(this.#hooks.get('*' as T) ?? [])
        .slice()
        .map(handler => handler.call(this.#context, event, ...payload)),
    ])
  }

  on(event: T, handler: EventHandler | WildCardEventHandler<T>) {
    this.#hooks.set(
      event, //
      [...(this.#hooks.get(event) ?? []), handler],
    )
  }

  once(type: T, handler: EventHandler | WildCardEventHandler<T>) {
    const onceHandler = (data?: any) => {
      this.off(type, onceHandler)
      return handler(data)
    }
    this.on(type, onceHandler)
  }

  off(type: T, handler: EventHandler | WildCardEventHandler<T>) {
    if (this.#hooks.get(type) !== undefined) {
      this.#hooks.set(
        type,
        this.#hooks.get(type)!.filter(v => v !== handler),
      )
    }
  }

  // TODO: Consider removing this
  waitFor(type: T) {
    return new Promise(resolve => this.once(type, resolve))
  }
}
