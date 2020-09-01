// Shim keyboard event data for IE and Edge for the time being
import 'shim-keyboard-event-key'
import { ensureHighResTime } from './timing'

// Split an eventString into event name, options and selector
const splitEventString = function(eventString: any) {
  // Split the eventString ('click(0) div > button')
  // into selector ('div > button'), event type ('click')
  // and additional filters (button '0')
  const directHandlerRegEx = /^(\w+)\s*([^()]*)$/
  const wrappedHandlerRegEx = /^(\w+)\(([\w\s,]+)\)\s*(.*)$/

  let eventName = null
  let filters = null
  let selector = null

  if (directHandlerRegEx.test(eventString)) {
    // @ts-expect-error ts-migrate(2461) FIXME: Type 'RegExpExecArray | null' is not an array type... Remove this comment to see the full error message
    [, eventName, selector] = directHandlerRegEx.exec(eventString)
  } else if (wrappedHandlerRegEx.test(eventString)) {
    // @ts-expect-error ts-migrate(2461) FIXME: Type 'RegExpExecArray | null' is not an array type... Remove this comment to see the full error message
    [, eventName, filters, selector] = wrappedHandlerRegEx.exec(eventString)
    filters = filters.split(',').map((o: any) => o.trim())
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
const makeChecks = function(eventName: any,
  { filters=[], filterRepeat=true, startTime=-Infinity }) {

  const checks = []

  // Check that event happened after the cut-off
  checks.push((e: any) => ensureHighResTime(e.timeStamp) >= startTime)

  // Add additional checks depending on the event type
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'includes' does not exist on type 'string... Remove this comment to see the full error message
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
      checks.push(function(e: any) {
        // Fire the handler only if
        // - we filter repeats, and the key is not one
        // - target keys are defined, and the key pressed matches one
        return (
          !(filterRepeat && e.repeat) &&
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'includes' does not exist on type 'never[... Remove this comment to see the full error message
          !(keys.length > 0 && !keys.includes(e.key))
        )
      })
    }
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'includes' does not exist on type 'string... Remove this comment to see the full error message
  } else if (['click', 'mousedown', 'mouseup'].includes(eventName)) {
    const buttons = (filters || []).map(
      button => parseInt(button),
    )

    if (buttons.length > 0) {
      // Wrap the handler accordingly
      checks.push(function(e: any) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'includes' does not exist on type 'number... Remove this comment to see the full error message
        return buttons.includes(e.button)
      })
    }
  }

  return checks
}

// @ts-expect-error ts-migrate(7031) FIXME: Binding element 'eventName' implicitly has an 'any... Remove this comment to see the full error message
const defaultProcessEvent = ([eventName, filters, selector]) =>
  ({ eventName, filters, selector })

// eslint-disable-next-line import/prefer-default-export
export class DomConnection {
  context: any;
  el: any;
  events: any;
  parsedEvents: any;
  processEvent: any;
  startTime: any;
  constructor(options: any) {
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

    // Define event processor
    this.processEvent = options.processEvent || defaultProcessEvent

    // Define time from which to accept responses
    this.startTime = -Infinity
  }

  // Handler preprocessing -----------------------------------------------------

  // Wrap event handlers such that a series of checks are applied
  // to each observed event, and the handler is triggered only
  // if all checks pass
  wrapHandler(handler: any, checks: any) {
    // Add context if desired
    if (this.context !== null) {
      handler = handler.bind(this.context)
    }

    // Only trigger handler if all checks pass
    return function(e: any) {
      return checks.reduce((acc: any, check: any) => acc && check(e), true)
        ? handler(e)
        : null;
    };
  }

  prepare() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'entries' does not exist on type 'ObjectC... Remove this comment to see the full error message
    this.parsedEvents = Object.entries(this.events)
      // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'eventString' implicitly has an 'a... Remove this comment to see the full error message
      .map(([eventString, handler]) => {
        // Split event string into constituent components,
        // and pass result onto event processing
        const { eventName, filters, selector, moreChecks=[] } =
          this.processEvent(splitEventString(eventString))

        // Apply the wrapHandler method to the handler,
        // so that any additional checks etc. are added
        const wrappedHandler = this.wrapHandler(handler, [
          ...makeChecks(eventName, { filters, startTime: this.startTime }),
          ...moreChecks,
        ])

        return [eventString, eventName, selector, wrappedHandler]
      })
  }

  // DOM interaction -----------------------------------------------------------
  attach() {
    // For each of the specified events and their
    // respective handlers ...
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'eventName' implicitly has an 'any... Remove this comment to see the full error message
    this.parsedEvents.forEach(([, eventName, selector, handler]) => {
      // Apply listeners
      if (selector !== '') {
        // If the event is constrainted to a certain element
        // or a set of elements, search for these within the
        // specified element, and add the handler to each
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
        Array.from(this.el.querySelectorAll(selector))
          .forEach((child: any) => child.addEventListener(eventName, handler))
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
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'eventName' implicitly has an 'any... Remove this comment to see the full error message
    this.parsedEvents.forEach(([, eventName, selector, handler]) => {
      if (selector !== '') {
        // Remove listener from specified elements
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
        Array.from(this.el.querySelectorAll(selector))
          .forEach((child: any) => child.removeEventListener(eventName, handler))
      } else {
        // Remove global listeners
        document.removeEventListener(
          eventName, handler,
        )
      }
    })
  }

  teardown() {
    // NOTE: Could also remove this.el, this.events and this.context,
    // but it's probably easier to allow the entire DomConnection to be GCed
    this.parsedEvents = null
  }
}
