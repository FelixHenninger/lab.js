// Split an event specifier into event name, options and selector
const splitEventString = function(eventString) {
  // Split the specifier ('click(0) div > button')
  // into selector ('div > button'), event type ('click')
  // and additional options ('0')
  const directHandlerRegEx = /^(\w+)\s*([^()]*)$/
  const wrappedHandlerRegEx = /^(\w+)\(([\w\s,]+)\)\s*(.*)$/

  let eventName = null
  let options = null
  let selector = null

  if (directHandlerRegEx.test(eventString)) {
    [, eventName, selector] = directHandlerRegEx.exec(eventString)
  } else if (wrappedHandlerRegEx.test(eventString)) {
    [, eventName, options, selector] = wrappedHandlerRegEx.exec(eventString)
    options = options.split(',').map(o => o.trim())
  } else {
    console.log('Can\'t interpret event string ', eventString)
  }

  return [eventName, options, selector]
}

const keycodeLabels = {
  ' ': 32,
  Enter: 13,
  Tab: 19,
  Backspace: 8,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
}

const keyValues = {
  Space: ' ',
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
      case 'keydown':
      case 'keyup':
        // Options define keys that trigger the handler
        // Keys, in turn, are defined in terms of the
        // key event values supplied by the browser
        // (cf. https://w3.org/TR/DOM-Level-3-Events-key).
        // However, not all browsers support the
        // key property (yet), so we provide a fallback
        // based on key codes for the time being. The
        // fallback is not complete in that it does not
        // support the full range of keys defined in the
        // spec, but rather those which we anticipate
        // will be used most frequently.
        // (enter, tab, backspace, and arrow keys)

        // Translate some keys that we choose
        // to represent differently (i.e. the
        // space key, which is a litteral space
        // character in the spec, but would be
        // trimmed here)
        const keys = options.map(
          key => keyValues[key] || key,
        )

        // Look up keycode for each key,
        // in case the browser does not support the key
        // property. This fallback will be removed as
        // more browsers support the w3c standard referenced
        // referenced above (specifically, Safari), c.f.
        // https://caniuse.com/#feat=keyboardevent-key
        const keycodes = keys.map(
          key => keycodeLabels[key] || key.charCodeAt(0),
        )

        // Wrap the handler to fire only
        // if the key pressed matches one
        // of those specified in the options
        return function(e) {
          if (
            (e.key && keys.includes(e.key)) ||
            (e.which && keycodes.includes(e.which))
          ) {
            return handler(e)
          } else {
            return null
          }
        }

      case 'click':
      case 'mousedown':
      case 'mouseup':
        // Filter clicks on a certain button
        const buttons = options.map(
          button => parseInt(button),
        )

        // Wrap the handler accordingly
        return function(e) {
          if (buttons.includes(e.button)) {
            return handler(e)
          } else {
            return null
          }
        }

      default:
        return handler
    } // switch
  }
}

// eslint-disable-next-line import/prefer-default-export
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
      (specifier) => {
        // ... loop over all elements matching the
        // selector, attaching a listener to each

        // Split event string into constituent components
        const [eventName, options, selector] = splitEventString(specifier)

        // Apply the wrapHandler function to the handler,
        // so that any additional filters etc. are added
        const handler = wrapHandler(
          this.events[specifier], eventName, options, this.context,
        )

        // Apply listeners
        if (selector !== '') {
          // If the event is constrainted to a certain element
          // or a set of elements, search for these within the
          // specified element, and add the handler to each
          Array.from(this.el.querySelectorAll(selector))
            .forEach(child => child.addEventListener(eventName, handler))
        } else {
          // If no selector is supplied, the listener is
          // added to the document itself
          document.addEventListener(
            eventName, handler,
          )
        }

        // Save the handler so that it can be retrieved later
        this.domHandlers[specifier] = handler
      },
    )
  }

  detach() {
    Object.keys(this.domHandlers).forEach(
      (specifier) => {
        // Split event string into constituent components
        const [eventName, , selector] = splitEventString(specifier)

        // Retrieve handler
        const handler = this.domHandlers[specifier]

        if (selector !== '') {
          // Remove listener from specified elements
          Array.from(this.el.querySelectorAll(selector))
            .forEach(child => child.removeEventListener(eventName, handler))
        } else {
          // Remove global listeners
          document.removeEventListener(
            eventName, handler,
          )
        }
      },
    ) // forEach over all DOM handlers
  }
}
