// Split an event specifier into event name, options and selector
const splitEventString = function(eventString) {
  // Split the specifier ('click(0) div > button')
  // into selector ('div > button'), event type ('click')
  // and additional options ('0')
  const directHandlerRegEx = /^(\w+)\s*([^()]*)$/
  const wrappedHandlerRegEx = /^(\w+)\(([\w,]+)\)\s*(.*)$/

  let eventName = null
  let options = null
  let selector = null

  if (directHandlerRegEx.test(eventString)) {
    [, eventName, selector] = directHandlerRegEx.exec(eventString)
  } else if (wrappedHandlerRegEx.test(eventString)) {
    [, eventName, options, selector] = wrappedHandlerRegEx.exec(eventString)
    options = options.split(' ')
  } else {
    console.log('Can\'t interpret event string ', eventString)
  }

  return [eventName, options, selector]
}

// Provide basic automatic wrapping for event handlers
// based on simple options, e.g. automatically filter
// events based on keyboard and mouse buttons.
const wrapHandler = function(handler, eventName, options=null, context=null) {
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

        // Look up keycode for each key
        const keycodes = options.map(
          key => keycodeLabels[key] || key.charCodeAt(0)
        )

        // Wrap the handler to fire only
        // when one of the codes is seen
        return function(e) {
          if (keycodes.includes(e.which)) {
            return handler(e)
          }
        }

      case 'click':
        // Filter clicks on a certain button
        const buttons = options.map(
          button => parseInt(button)
        )

        // Wrap the handler accordingly
        return function(e) {
          if (buttons.includes(e.button)) {
            return handler(e)
          }
        }
    } // switch
  }
}

const keycodeLabels = {
  space: 32,
  enter: 13,
  tab: 19,
  backspace: 8,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
}

export class DomConnection {
  constructor(options) {
    // Limit search for elements to a
    // specified scope if possible,
    // otherwise search the entire document.
    this.el = options.el || document

    // Define the handlers for a set of events
    this.events = options.events || {}

    // Define default context
    // in which to run handlers
    this.context = options.context || this

    // Collect DOM handlers
    this.domHandlers = {}
  }

  // DOM event handling -----------
  attach() {
    // For each of the specified events and their
    // respective handlers ...
    Object.keys(this.events).forEach(
      specifier => {
        // ... loop over all elements matching the
        // selector, attaching a listener to each

        // Split event string into constituent components
        const [eventName, options, selector] = splitEventString(specifier)

        // Apply the wrapHandler function to the handler,
        // so that any additional filters etc. are added
        const handler = wrapHandler(
          this.events[specifier], eventName, options, this.context
        )

        // Apply listeners
        if (selector !== '') {
          // If the event is constrainted to a certain element
          // or a set of elements, search for these within the
          // specified element, and add the handler to each
          for (const child of Array.from(this.el.querySelectorAll(selector))) {
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
        this.domHandlers[specifier] = handler
      }
    )
  }

  detach() {
    Object.keys(this.domHandlers).forEach(
      specifier => {
        // Split event string into constituent components
        const [eventName, , selector] = splitEventString(specifier)

        // Retrieve handler
        const handler = this.domHandlers[specifier]

        if (selector !== '') {
          // Remove listener from specified elements
          for (const child of Array.from(this.el.querySelectorAll(selector))) {
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
  }
}
