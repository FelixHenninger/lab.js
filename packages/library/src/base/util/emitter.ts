// This emitter is modelled after the mitt emitter
// by Jason Miller, see https://github.com/developit/mitt .
// Any mistakes, of course, are entirely my own.

export type EventHandler = (...payload: any[]) => void
type WildCardEventHandler = (event: string, ...payload: any[]) => void

// Currently registered handlers for an event
type EventHandlerList = Array<EventHandler>
type WildCardEventHandlerList = Array<WildCardEventHandler>

// Map events to their corresponding handlers
type PureEventHandlerMap = {
  [type: string]: EventHandlerList
}
type EventHandlerMap = PureEventHandlerMap & {
  '*'?: WildCardEventHandlerList
}
// TODO: Is there an easier way to do this?

export type EmitterOptions = {
  debug?: boolean
}

// Event name splitter functions
const splitter = /(^|:)(\w)/gi
const getEventName = function (_m: string, _pre: string, eventName: string) {
  return eventName.toUpperCase()
}
const getMethodName = function (event: string) {
  return `on${event.replace(splitter, getEventName)}`
}

export class Emitter {
  id?: string
  options: EmitterOptions
  #hooks: EventHandlerMap

  constructor(id?: string, options: EmitterOptions = { debug: false }) {
    this.id = id
    this.options = options
    this.#hooks = {}
  }

  async trigger(event: string, ...payload: any[]) {
    if (this.options.debug) {
      console.info(`Caught ${event} on ${this.id}, data`, payload)
    }

    // Trigger local method, if available
    const methodName = getMethodName(event)
    const method = (this as any)[methodName]
    if (method && typeof method === 'function') {
      await method.apply(this, payload)
    }

    await this.emit(event, ...payload)
  }

  async emit(event: string, ...payload: any[]) {
    await Promise.all([
      ...(this.#hooks[event] ?? [])
        .slice()
        .map(handler => handler.apply(this, payload)),
      ...(this.#hooks['*'] ?? [])
        .slice()
        .map(handler => handler.call(this, event, ...payload)),
    ])
  }

  on(event: string, handler: EventHandler | WildCardEventHandler) {
    ;(this.#hooks[event] ?? (this.#hooks[event] = [])).push(handler)
  }

  once(type: string, handler: EventHandler | WildCardEventHandler) {
    const onceHandler = (data?: any) => {
      this.off(type, onceHandler)
      return handler(data)
    }
    this.on(type, onceHandler)
  }

  off(type: string, handler: EventHandler | WildCardEventHandler) {
    if (this.#hooks[type]) {
      this.#hooks[type].splice(this.#hooks[type].indexOf(handler) >>> 0, 1)
    }
  }

  // TODO: Consider removing this
  waitFor(type: string) {
    return new Promise(resolve => this.once(type, resolve))
  }
}
