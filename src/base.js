// Polyfill for iterating NodeLists
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// JQuery emulation
let domSelect = function(selector, parent=document) {
  // If the selection occurs by id,
  // use getElementById, or querySelectorAll otherwise
  let selectorType = selector.indexOf('#') === 0 ?
    'getElementById' : 'querySelectorAll'

  // If we are using getElementById, remove
  // the leading '#' from the selector
  if (selectorType === 'getElementById') {
    selector = selector.substr(1, selector.length)
  }

  // Apply the appropriate selector to the
  // parent element
  return parent[selectorType](selector)
};

// Split an event specifier into event name, options and selector
let splitEventString = function(eventString) {
  // Split the specifier ('click(0) div > button')
  // into selector ('div > button'), event type ('click')
  // and additional options ('0')
  let re_handler_direct = /^(\w+)\s*([^()]*)$/
  let re_handler_wrapped = /^(\w+)\(([\w,]+)\)\s*(.*)$/

  let eventName = null
  let options = null
  let selector = null

  if (re_handler_direct.test(eventString)) {
    [, eventName, selector] = re_handler_direct.exec(eventString)
  } else if (re_handler_wrapped.test(eventString)) {
    [, eventName, options, selector] = re_handler_wrapped.exec(eventString)
    options = options.split(' ')
  } else {
    console.log('Can\'t interpret event string ', eventString)
  }

  return [eventName, options, selector]
}

// Provide basic automatic wrapping for event handlers
// based on simple options, e.g. automatically filter
// events based on keyboard and mouse buttons.
let wrapHandler = function(handler, eventName, options=null, context=null) {
  // Add context if desired
  if (context !== null) {
    handler = handler.bind(context)
  }

  // Handle additional event options, if any
  if (options === null) {
    // Without further options,
    // use the handler as-is
    return handler
  } else {
    // Otherwise, wrap the handler
    // depending on the event type
    switch (eventName) {
      case 'keypress':
        // Options filter defined keys
        let keycodes_lookup = {
          'space': 32,
          'enter': 13,
          'tab': 19,
          'backspace': 8
        }

        // Look up keycode for each key
        let keycodes = options.map(
          key => keycodes_lookup[key] || key.charCodeAt(0)
        )

        // Wrap the handler to fire only
        // when one of the codes is seen
        return function(e) {
          if (_.contains(keycodes, e.which)) {
            return handler(e)
          }
        }

      case 'click':
        // Filter clicks on a certain button
        let buttons = options.map(
          button => parseInt(button)
        )

        // Wrap the handler accordingly
        return function(e) {
          if (_.contains(buttons, e.button)) {
            return handler(e)
          }
        }

    }
  }
}

// Most of the 'magic' that happens in the library
// is due to event handling. The following class
// provides a basic framework for this, in that is
// allows for custom events on an object, and handles
// DOM event binding and unbinding.
class EventHandler {
  constructor(options={}) {
    this._callbacks = {}
    this._domHandlers = {}
    this.events = {}

    this.debug = options.debug || false

    this.on('run', this.addDOMListeners)
    this.on('end', this.removeDOMListeners)
  }

  // Basic event handling
  // This is modelled after the component emitter,
  // see https://github.com/component/emitter.git
  // Any mistakes, of course, are entirely my own.
  on(event, fn) {
    this._callbacks['$' + event] = this._callbacks['$' + event] || []
    this._callbacks['$' + event].push(fn)
    return this
  }

  off(event, fn=null) {
    if (fn === null) {
      // If there is no specific handler specified,
      // remove all handlers for an event
      delete this._callbacks['$' + event]
    } else {
      // If a specific handler is given, search for
      // it and remove just this one handler
      this._callbacks['$' + event] =
        this._callbacks['$' + event].filter((cb) => cb !== fn)
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

  // Trigger handling
  // This is heavily inspired by the excellent backbone.marionette, see
  // http://marionettejs.com/annotated-src/backbone.marionette.html#section-96
  // (though I do not catch as many special cases, probably to my peril)
  trigger(event, ...args) {
    // Trigger all callbacks for a specific event
    let callbacks = this._callbacks['$' + event]
    if (callbacks)
      callbacks.forEach(c => c.apply(this, args))

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
    let splitter = /(^|:)(\w)/gi

    // Transform an event name by splitting it
    // and capitalizing the consitutent parts,
    // for example:
    // run -> onRun
    // before:prepare -> onBeforePrepare
    function getEventName(match, prefix, eventName) {
      return eventName.toUpperCase()
    }
    let methodName = 'on' + event.replace(splitter, getEventName)

    // If there is a method called methodName,
    // run it and save the results
    let method = this[methodName]
    let result
    if (_.isFunction(method)) {
      result = method.apply(this, args)
    }

    // If the object has a trigger function,
    // call it with the arguments supplied
    this.trigger.apply(this, [event].concat(args))

    // Return the result of the object's onEvent method
    return result
  }

  // DOM event handling -----------
  addDOMListeners() {
    // If no containing element is specified, search
    // for the specified element in the entire document
    let parent = this.el || document

    // If DOM event handlers are specified,
    // hook up the associated event handlers
    if (this.events) {
      // For each of the specified events and their
      // respective handlers ...
      Object.keys(this.events).forEach(
        (specifier) => {
          // ... loop over all elements matching the
          // selector, attaching a listener to each

          // Split event string into constituent components
          let [eventName, options, selector] = splitEventString(specifier)

          // Apply the wrapHandler function to the handler,
          // so that any additional filters etc. are added
          let handler = wrapHandler(
            this.events[specifier], eventName, options, this
          )

          // Apply listeners
          if (selector !== '') {
            // If the event is constrainted to a certain element
            // or a set of elements, search for these within the
            // specified element, and add the handler to each
            for (let child of parent.querySelectorAll(selector)) {
              child.addEventListener(
                eventName, handler
              )
            }
          } else {
            // If no selector is supplied, the listener is
            // added to the document itself
            document.addEventListener(
              eventName, handler
            )
          }

          // Save the handler so that it can be retrieved later
          this._domHandlers[specifier] = handler

        }
      ) // forEach over all events
    } // if clause

    this.triggerMethod('after:event:init')
  }

  removeDOMListeners() {
    // Search in the entire document
    // if the element scope is not defined
    let parent = this.el || document

    Object.keys(this._domHandlers).forEach(
      (specifier) => {
        // Split event string into constituent components
        let [eventName, , selector] = splitEventString(specifier)

        // Retrieve handler
        let handler = this._domHandlers[specifier]

        if (selector !== '') {
          // Remove listener from specified elements
          for (let child of parent.querySelectorAll(selector)) {
            child.removeEventListener(
              eventName, handler
            )
          }
        } else {
          // Remove global listeners
          document.removeEventListener(
            eventName, handler
          )
        }
      }
    ) // forEach over all DOM handlers

    this.triggerMethod('after:event:remove')
  }
}
