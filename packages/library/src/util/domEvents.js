// Shim keyboard event data for IE and Edge for the time being
import 'shim-keyboard-event-key'
import { ensureHighResTime } from './timing'

// Split an eventString into event name, options and selector
const splitEventString = function(eventString) {
  // Split the eventString ('click(0) div > button')
  // into selector ('div > button'), event type ('click')
  // and additional filters (button '0')
  const directHandlerRegEx = /^(\w+)\s*([^()]*)$/
  const wrappedHandlerRegEx = /^(\w+)\(([\w\s,]+)\)\s*(.*)$/

  let eventName = null
  let filters = null
  let selector = null

  if (directHandlerRegEx.test(eventString)) {
    [, eventName, selector] = directHandlerRegEx.exec(eventString)
  } else if (wrappedHandlerRegEx.test(eventString)) {
    [, eventName, filters, selector] = wrappedHandlerRegEx.exec(eventString)
    filters = filters.split(',').map(o => o.trim())
  } else {
    console.log('Can\'t interpret event string ', eventString)
  }

  return [eventName, filters, selector]
}

const keyValues = {
  Space: ' ',
}

// Generate a sequence of checks to apply to an event
// before triggering a handler function
const makeChecks = function(eventName,
  { filters=[], filterRepeat=true, startTime=-Infinity }) {

  const checks = []

  // Check that event happened after the cut-off
  checks.push(e => ensureHighResTime(e.timeStamp) >= startTime)

  // Add additional checks depending on the event type
  if (['keypress', 'keydown', 'keyup'].includes(eventName)) {
    // Filters define keys that trigger the handler. Keys, in turn,
    // are defined in terms of the key event values supplied by the
    // browser (cf. https://w3.org/TR/DOM-Level-3-Events-key).
    // However, not all browsers support the key property (yet), so we
    // provide a fallback based on key codes for the time being. The
    // fallback is not complete in that it does not support the full
    // range of keys defined in the spec, but rather those which we
    // anticipate will be used most frequently. (enter, tab,
    // backspace, and arrow keys)

    // Translate some keys that we choose to represent differently
    // (i.e. the space key, which is a literal space character in the
    // spec, but would be trimmed here)
    const keys = (filters || []).map( // (replace null value)
      key => keyValues[key] || key,
    )

    // Wrap the handler only if we pre-select events
    if (keys.length > 0 || filterRepeat) {
      checks.push(function(e) {
        // Fire the handler only if
        // - we filter repeats, and the key is not one
        // - target keys are defined, and the key pressed matches one
        return (
          !(filterRepeat && e.repeat) &&
          !(keys.length > 0 && !keys.includes(e.key))
        )
      })
    }
  } else if (['click', 'mousedown', 'mouseup'].includes(eventName)) {
    const buttons = (filters || []).map(
      button => parseInt(button),
    )

    if (buttons.length > 0) {
      // Wrap the handler accordingly
      checks.push(function(e) {
        return buttons.includes(e.button)
      })
    }
  }

  return checks
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
    this.parsedEvents = []

    // Define default context
    // in which to run handlers
    this.context = options.context || this

    // Define time from which to accept responses
    this.startTime = -Infinity
  }

  // Handler preprocessing -----------------------------------------------------

  // Wrap event handlers such that a series of checks are applied
  // to each observed event, and the handler is triggered only
  // if all checks pass
  wrapHandler(handler, eventName, checkOptions={}) {
    // Add context if desired
    if (this.context !== null) {
      handler = handler.bind(this.context)
    }

    // Create array for checks to be applied to the event
    const checks = makeChecks(eventName, checkOptions)

    // Only trigger handler if all checks pass
    return function(e) {
      return checks.reduce((acc, check) => acc && check(e), true)
        ? handler(e)
        : null
    }
  }

  prepare() {
    this.parsedEvents = Object.entries(this.events)
      .map(([eventString, handler]) => {
        // ... loop over all elements matching the
        // selector, attaching a listener to each

        // Split event string into constituent components
        const [eventName, filters, selector] = splitEventString(eventString)

        // Apply the wrapHandler function to the handler,
        // so that any additional filters etc. are added
        const wrappedHandler = this.wrapHandler(
          handler, eventName,
          { filters, startTime: this.startTime },
        )

        return [eventString, eventName, selector, wrappedHandler]
      })
  }

  // DOM interaction -----------------------------------------------------------
  attach() {
    // For each of the specified events and their
    // respective handlers ...
    this.parsedEvents.forEach(([, eventName, selector, handler]) => {
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
    })
  }

  detach() {
    this.parsedEvents.forEach(([, eventName, selector, handler]) => {
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
    })
  }
}
