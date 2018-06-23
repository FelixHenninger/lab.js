import { isFunction } from 'lodash'
import PluginAPI from '../plugins/api'

// Most of the 'magic' that happens in the library
// is due to event handling. The following class
// provides a basic framework for this, in that is
// allows for custom events on an object.
export class EventHandler {
  constructor(options={}) {
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
    this.internals.rawOptions.plugins.map(p => this.plugins.add(p))
  }

  // Basic event handling
  // This is modelled after the component emitter,
  // see https://github.com/component/emitter.git
  // Any mistakes, of course, are entirely my own.
  on(event, fn) {
    // Setup displayName for easier debugging
    fn.displayName = fn.displayName ||
      `${ event } handler on ${ this.internals.rawOptions.title }`

    this.internals.callbacks[`$${ event }`] =
      this.internals.callbacks[`$${ event }`] || []
    this.internals.callbacks[`$${ event }`].push(fn)
    return this
  }

  off(event, fn=null) {
    if (fn === null) {
      // If there is no specific handler specified,
      // remove all handlers for an event
      delete this.internals.callbacks[`$${ event }`]
    } else {
      // If a specific handler is given, search for
      // it and remove just this one handler
      this.internals.callbacks[`$${ event }`] =
        this.internals.callbacks[`$${ event }`].filter(cb => cb !== fn)
    }
    return this
  }

  once(event, fn) {
    // Create a handler for the event that will
    // remove itself, then trigger the supplied
    // function.
    function onceHandler(...args) {
      this.off(event, onceHandler)
      fn.apply(this, args)
    }

    // Hook up the specified handler to the above
    // function, and add it to the callbacks
    onceHandler.fn = fn
    this.on(event, onceHandler)

    return this
  }

  waitFor(event) {
    // Return a promise that resolves when
    // the event in question is triggered
    return new Promise(
      resolve => this.on(event, resolve),
    )
  }

  // Trigger handling
  // This is heavily inspired by the excellent backbone.marionette, see
  // http://marionettejs.com/annotated-src/backbone.marionette.html#section-96
  // (though I do not catch as many special cases, probably to my peril)
  async trigger(event, ...args) {
    // Trigger all callbacks for a specific event,
    // within the context of the current object
    const callbacks = this.internals.callbacks[`$${ event }`]
    if (callbacks) {
      await Promise.all(
        callbacks.map(
          c => c.apply(this, args),
        ),
      )
    }

    // Trigger plugin events
    await this.plugins.trigger(event, ...args)

    return this
  }

  async triggerMethod(event, ...args) {
    if (this.internals.rawOptions.debug) {
      // Tell the world what we're up to
      console.info(
        `%c${ this.internals.rawOptions.title }%c (${ this.type }) → ` +
        `Event %c${ event }%c · arguments [${ args }]`,
        'font-weight: bold', // Title
        'font-weight: normal', // Component type
        'font-weight: bold', // Event name
        'font-weight: normal; opacity: 0.5', // Remaining text
      )
      console.time(
        `${ event } on ${ this.internals.rawOptions.title }` +
        `(${ this.internals.rawOptions.id })`
      )
    }

    // Regex to split the event name by colons
    const splitter = /(^|:)(\w)/gi

    // Transform an event name by splitting it
    // and capitalizing the consitutent parts,
    // for example:
    // run -> onRun
    // before:prepare -> onBeforePrepare
    function getEventName(match, prefix, eventName) {
      return eventName.toUpperCase()
    }
    const methodName = `on${ event.replace(splitter, getEventName) }`

    // If there is a method called methodName,
    // run it and save the results
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
        `${ event } on ${ this.internals.rawOptions.title }` +
        `(${ this.internals.rawOptions.id })`
      )
    }

    // Return the result of the object's onEvent method
    return result
  }
}
