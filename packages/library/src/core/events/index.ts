// Shim keyboard event data for IE and Edge for the time being
import 'shim-keyboard-event-key'

// Split an eventString into event name, options and selector
const splitEventString = function (
  eventString: string,
): [string, string[], string] {
  // Split the eventString ('click(0) div > button')
  // into selector ('div > button'), event type ('click')
  // and additional filters (button '0')
  const directHandlerRegEx = /^(\w+)(?:\s+(.*))?$/
  const wrappedHandlerRegEx = /^(\w+)\(([^()]+)\)(?:\s+(.*))?$/

  let eventName = ''
  let filterString
  let filters: string[] = []
  let selector = null

  if (directHandlerRegEx.test(eventString)) {
    [, eventName, selector] = directHandlerRegEx.exec(eventString)!
  } else if (wrappedHandlerRegEx.test(eventString)) {
    [, eventName, filterString, selector] =
      wrappedHandlerRegEx.exec(eventString)!
    filters = filterString.split(',').map((o: string) => o.trim())
  } else {
    console.log("Can't interpret event string ", eventString)
  }

  // The selector defaults to an empty string
  return [eventName, filters, selector ?? '']
}

const keyValues: { [key: string]: string } = {
  Space: ' ',
  Comma: ',',
}

// Generate a sequence of checks to apply to an event
// before triggering a handler function
const makeChecks = function (
  eventName: string,
  {
    filters = [],
    filterRepeat = true,
    startTime = -Infinity,
  }: {
    filters: string[]
    filterRepeat?: boolean
    startTime?: number
  },
) {
  const checks: (<E extends Event>(event: E) => boolean)[] = []

  // Check that event happened after the cut-off
  checks.push((e: Event) => e.timeStamp >= startTime)

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
    const keys = filters.map(
      // (replace null value)
      key => keyValues[key] ?? key,
    )

    // Wrap the handler only if we pre-select events
    if (keys.length > 0 || filterRepeat) {
      checks.push(function (e: Event) {
        // Fire the handler only if
        // - we filter repeats, and the key is not one
        // - target keys are defined, and the key pressed matches one
        return (
          e instanceof KeyboardEvent &&
          !(filterRepeat && e.repeat) &&
          !(keys.length > 0 && !keys.includes(e.key))
        )
      })
    }
  } else if (['click', 'mousedown', 'mouseup'].includes(eventName)) {
    const buttons = filters.map(button => parseInt(button))

    if (buttons.length > 0) {
      // Wrap the handler accordingly
      checks.push(function (e: Event) {
        return e instanceof MouseEvent && buttons.includes(e.button)
      })
    }
  }

  return checks
}

const defaultProcessEvent = (
  // Pass-through (can be replaced with more elaborate logic)
  [eventName, filters, selector]: [string, string[], string],
) => ({
  eventName,
  filters,
  selector,
  moreChecks: [] as ((e: Event, context: any) => void)[],
})

export type EventMap = { [eventString: string]: (e: Event) => void }

export class DomConnection {
  el: HTMLElement | Document
  events: EventMap
  parsedEvents: [string, string, string, EventListener][]
  context: any
  processEvent: typeof defaultProcessEvent
  startTime: number

  constructor({
    el,
    events,
    context,
    processEvent,
  }: {
    el?: HTMLElement | Document
    events?: EventMap
    context: any
    processEvent?: typeof defaultProcessEvent
  }) {
    // Limit search for elements to a
    // specified scope if possible,
    // otherwise search the entire document.
    this.el = el || document

    // Define the handlers for a set of events
    this.events = events || {}
    this.parsedEvents = []

    // Define default context
    // in which to run handlers
    this.context = context || this

    // Define event processor
    this.processEvent = processEvent || defaultProcessEvent

    // Define time from which to accept responses
    this.startTime = -Infinity
  }

  // Handler preprocessing -----------------------------------------------------

  // Wrap event handlers such that a series of checks are applied
  // to each observed event, and the handler is triggered only
  // if all checks pass
  wrapHandler(
    handler: (...args: any[]) => any,
    checks: ((...args: any[]) => any)[],
  ) {
    // Add context if desired
    if (this.context !== null) {
      handler = handler.bind(this.context)
    }

    // Only trigger handler if all checks pass
    return (e: Event) =>
      checks.reduce((acc, check) => acc && check(e, this.context), true)
        ? handler(e)
        : null
  }

  prepare() {
    this.parsedEvents = Object.entries(this.events).map(
      ([eventString, handler]) => {
        // Split event string into constituent components,
        // and pass result onto event processing
        const {
          eventName,
          filters,
          selector,
          moreChecks = [],
        } = this.processEvent(splitEventString(eventString))

        // Apply the wrapHandler method to the handler,
        // so that any additional checks etc. are added
        const wrappedHandler = this.wrapHandler(handler, [
          ...makeChecks(eventName, { filters, startTime: this.startTime }),
          ...moreChecks,
        ])

        return [eventString, eventName, selector, wrappedHandler]
      },
    )
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
        Array.from(this.el.querySelectorAll(selector)).forEach(child =>
          child.addEventListener(eventName, handler),
        )
      } else {
        // If no selector is supplied, the listener is
        // added to the document itself
        document.addEventListener(eventName, handler)
      }
    })
  }

  detach() {
    this.parsedEvents.forEach(([, eventName, selector, handler]) => {
      if (selector !== '') {
        // Remove listener from specified elements
        Array.from(this.el.querySelectorAll(selector)).forEach(child =>
          child.removeEventListener(eventName, handler),
        )
      } else {
        // Remove global listeners
        document.removeEventListener(eventName, handler)
      }
    })
  }

  teardown() {
    // NOTE: Could also remove this.el, this.events and this.context,
    // but it's probably easier to allow the entire DomConnection to be GCed
    this.parsedEvents = []
  }
}
