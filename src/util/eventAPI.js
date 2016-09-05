import PluginAPI from '../plugins/api'
import { isFunction } from 'lodash'

// Most of the 'magic' that happens in the library
// is due to event handling. The following class
// provides a basic framework for this, in that is
// allows for custom events on an object.
export class EventHandler {
  constructor(options={}) {
    // Internal storage for whatever,
    // not supposed to be accessed by end-users
    this.internals = {}

    // Collect callbacks
    this.internals.callbacks = {}

    // Add plugin support
    this.plugins = new PluginAPI(this)

    // Debug state
    this.debug = options.debug || false
  }

  // Basic event handling
  // This is modelled after the component emitter,
  // see https://github.com/component/emitter.git
  // Any mistakes, of course, are entirely my own.
  on(event, fn) {
    this.internals.callbacks[`$${ event }`] = this.internals.callbacks[`$${ event }`] || []
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
      resolve => this.on(event, resolve)
    )
  }

  // Trigger handling
  // This is heavily inspired by the excellent backbone.marionette, see
  // http://marionettejs.com/annotated-src/backbone.marionette.html#section-96
  // (though I do not catch as many special cases, probably to my peril)
  trigger(event, ...args) {
    // Trigger all callbacks for a specific event
    const callbacks = this.internals.callbacks[`$${ event }`]
    if (callbacks) {
      callbacks.forEach(c => c.apply(this, args))
    }
    // Note that the apply method will set the context
    // to the local object

    // Trigger plugin events
    this.plugins.trigger(event, ...args)

    return this
  }

  triggerMethod(event, ...args) {
    if (this.debug) {
      // Tell the world what we're up to
      console.info(
        `Event %c${ event }%c → arguments [${ args }]`,
        'font-weight: bold', // Event name
        'font-weight: normal; opacity: 0.5' // Remaining text
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
      result = method.apply(this, args)
    }

    // If the object has a trigger function,
    // call it with the arguments supplied
    this.trigger.apply(this, [event].concat(args))

    // Return the result of the object's onEvent method
    return result
  }
}
