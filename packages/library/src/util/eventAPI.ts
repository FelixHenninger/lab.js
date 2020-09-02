import { isFunction } from 'lodash'
import PluginAPI from '../plugins/api'

// Most of the 'magic' that happens in the library
// is due to event handling. The following class
// provides a basic framework for this, in that is
// allows for custom events on an object.
export class EventHandler {
  internals: any

  plugins: any

  type: any

  constructor(options = {}) {
    // Internal storage for whatever,
    // not supposed to be accessed by end-users
    this.internals = {
      // Collect callbacks
      callbacks: {},
      // Define default options
      rawOptions: {
        debug: false,
        plugins: [],
        ...options,
      },
      parsedOptions: {},
    }

    // Add plugin support
    this.plugins = new PluginAPI(this)
    this.internals.rawOptions.plugins.map((p: any) => this.plugins.add(p))
  }

  // Basic event handling
  // This is modelled after the component emitter,
  // see https://github.com/component/emitter.git
  // Any mistakes, of course, are entirely my own.
  on(event: any, fn: any) {
    // Setup displayName for easier debugging
    fn.displayName =
      fn.displayName || `${event} handler on ${this.internals.rawOptions.title}`

    this.internals.callbacks[`$${event}`] =
      this.internals.callbacks[`$${event}`] || []
    this.internals.callbacks[`$${event}`].push(fn)
    return this
  }

  off(event: any, fn = null) {
    if (fn === null) {
      // If there is no specific handler specified,
      // remove all handlers for an event
      delete this.internals.callbacks[`$${event}`]
    } else {
      // If a specific handler is given, search for
      // it and remove just this one handler
      this.internals.callbacks[`$${event}`] = this.internals.callbacks[
        `$${event}`
      ].filter((cb: any) => cb !== fn)
    }
    return this
  }

  once(event: any, fn: any) {
    // Create a handler for the event that will
    // remove itself, then trigger the supplied
    // function.
    // @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
    function onceHandler(...args) {
      // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      this.off(event, onceHandler)
      // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      return fn.apply(this, args)
    }

    // Hook up the specified handler to the above
    // function, and add it to the callbacks
    onceHandler.fn = fn
    this.on(event, onceHandler)

    return this
  }

  waitFor(event: any) {
    // Return a promise that resolves when
    // the event in question is triggered

    return new Promise((resolve: any) => this.on(event, resolve))
  }

  // Trigger handling
  // This is heavily inspired by the excellent backbone.marionette, see
  // http://marionettejs.com/annotated-src/backbone.marionette.html#section-96
  // (though I do not catch as many special cases, probably to my peril)
  // @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
  async trigger(event: any, ...args) {
    // Trigger all callbacks for a specific event,
    // within the context of the current object
    const callbacks = this.internals.callbacks[`$${event}`]
    if (callbacks) {
      try {
        // Go through all callbacks

        await Promise.all(callbacks.map((c: any) => c.apply(this, args)))
      } catch (e) {
        // Log and rethrow error
        console.error(
          `%cError in ${this.internals.rawOptions.title}%c ` +
            `during event ${event}%c: ${e}`,
          'font-weight: bold', // Component title
          'font-weight: normal', // Event type
          'font-weight: normal; opacity: 0.5', // Remaining text
        )
        throw e
      }
    }

    // Trigger plugin events
    await this.plugins.trigger(event, ...args)

    return this
  }

  // @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
  async triggerMethod(event: any, ...args) {
    if (this.internals.rawOptions.debug) {
      // Tell the world what we're up to
      console.info(
        `%c${this.internals.rawOptions.title}%c (${this.type}) → ` +
          `Event %c${event}%c · arguments [${args}]`,
        'font-weight: bold', // Title
        'font-weight: normal', // Component type
        'font-weight: bold', // Event name
        'font-weight: normal; opacity: 0.5', // Remaining text
      )
      console.time(
        `${event} on ${this.internals.rawOptions.title}` +
          `(${this.internals.rawOptions.id})`,
      )
    }

    // Regex to split the event name by colons
    const splitter = /(^|:)(\w)/gi

    // Transform an event name by splitting it
    // and capitalizing the consitutent parts,
    // for example:
    // run -> onRun
    // before:prepare -> onBeforePrepare
    function getEventName(match: any, prefix: any, eventName: any) {
      return eventName.toUpperCase()
    }
    const methodName = `on${event.replace(splitter, getEventName)}`

    // If there is a method called methodName,
    // run it and save the results
    // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
    const method = this[methodName]
    let result
    if (isFunction(method)) {
      result = await method.apply(this, args)
    }

    // If the object has a trigger function,
    // call it with the arguments supplied
    await this.trigger(event, ...args)

    if (this.internals.rawOptions.debug) {
      // Tell the world what we're up to
      console.timeEnd(
        `${event} on ${this.internals.rawOptions.title}` +
          `(${this.internals.rawOptions.id})`,
      )
    }

    // Return the result of the object's onEvent method
    return result
  }
}
