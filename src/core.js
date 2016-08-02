import { EventHandler } from './util/eventAPI'
import { DomConnection } from './util/domEvents'
import { preloadImage, preloadAudio } from './util/preload'
import { promiseChain } from './util/promise'
import { extend } from 'lodash-es'

// Define status codes
export const status = Object.freeze({
  initialized:  0,
  prepared:     1,
  running:      2,
  done:         3,
})

// Generic building block for experiment
export class Component extends EventHandler {
  constructor(options={}) {
    // Construct the EventHandler first
    super(options)

    // Setup a storage for internal properties
    // (these are not supposed to be directly
    // available to users, and will not be documented)
    this.internals = this.internals || {}

    // Setup a space for timestamps within
    // the internal data structure
    this.internals.timestamps = {}

    // Setup a document node within which
    // the element operates
    this.el = options.el || null

    // Add a DomConnection that connects
    // DOM events to internal handlers
    this.internals.domConnection = new DomConnection({
      el: this.el,
      context: this,
    })
    this.events = options.events || {}
    this.on('run', () => {
      this.internals.domConnection.attach()
      this.triggerMethod('after:event:init')
    })
    this.on('end', () => {
      this.internals.domConnection.detach()
      this.triggerMethod('after:event:remove')
    })

    // Save the title of element as well as
    // its position in the hierarchy
    this.title = options.title || null
    this.id = options.id || null

    // Setup 'tardyness'
    // If this option is set, the element will not
    // respond to automated calls to its prepare
    // method by superordinate elements (e.g. a
    // sequence in which it is nested). Instead,
    // it will prepare when run or after a manual
    // .prepare() call.
    this.tardy = options.tardy || false

    // Save element status
    this.status = status.initialized

    // Set parent, if defined
    this.parent = options.parent || null

    // Setup responses
    this.responses = options.responses || {}
    this.correctResponse = options.correctResponse || null

    // Setup data handling
    this.data = options.data || {}
    this.datastore = options.datastore || null
    this.datacommit = options.datacommit || null

    // Setup parameters
    this.parameters = options.parameters || {}

    // Setup media handling
    this.media = options.media || {}
    this.media.images = this.media.images || []
    this.media.audio = this.media.audio || []

    // Set a timeout, if a useful value is provided
    // (this somewhat convoluted query is necessary
    // because a zero value evaluates to false in JS)
    this.timeout = options.timeout || options.timeout === 0 ?
      options.timeout : null

    // Setup console output grouping
    // when the element is run
    if (this.debug) {
      this.on('before:run', () => console.group(this.type))
      this.on('after:end', () => console.groupEnd())
    }
  }

  // Actions ----------------------------------------------
  prepare(directCall=true) {
    // Prepare an element prior to its display,
    // for example by pre-loading or pre-rendering
    // content

    // Skip the remainder of the function if the
    // prepare call was automated and the element
    // is labeled as tardy
    if (this.tardy && !directCall) {
      if (this.debug) {
        console.log('Skipping automated preparation')
      }
      return Promise.resolve()
    }

    // Direct output to the HTML element with the id
    // 'labjs-content', unless a different element
    // has been provided explicitly
    if (this.debug && this.el == null) {
      console.log('No output element specified, using #labjs-content')
    }
    this.el = this.el || document.getElementById('labjs-content')

    // Setup automatic event handling for responses
    Object.keys(this.responses).forEach(
      eventString => {
        this.events[eventString] = () => {
          // Trigger internal response handling
          this.respond(this.responses[eventString])
        }
      }
    )
    // Push existing events and el to DomConnection
    this.internals.domConnection.events = this.events
    this.internals.domConnection.el = this.el

    // Prepare timeout
    if (this.timeout !== null) {
      // Add a timeout to end the element
      // automatically after the specified
      // duration.
      this.on('run', () => {
        this.internals.timeoutTimer = window.setTimeout(
          () => this.end('timeout'),
          this.timeout
        )
      })
    }

    // Setup data storage
    // (unless it has been explicitly disabled)
    if (this.datastore && this.datacommit !== false) {
      this.datacommit = true
      this.on('after:end', this.commit)
    }

    return promiseChain([
      // Preload media
      () => Promise.all(this.media.images.map(preloadImage)),
      () => Promise.all(this.media.audio.map(preloadAudio)),
      // Trigger related methods
      () => this.triggerMethod('prepare', directCall),
      // Update status
      () => (this.status = status.prepared),
      // TODO: Need to reflect on the order of the last
      // two operations. A problem emerged that calls
      // to 'run' in a prepare handler would lead to
      // double preparation, therefore the current order
      // was chosen. However, this might be revised
      // at some later point for clearer semantics.
    ])
  }

  run() {
    // Promise that represents the entire run
    // of the element
    const p = new Promise(
      resolve => this.on('end', resolve)
    )
    let chain // Chain for intermediate promises

    // Prepare element if this has not been done
    if (this.status < status.prepared) {
      if (this.debug) {
        console.log('Preparing at the last minute')
      }
      chain = this.prepare()
    } else {
      chain = Promise.resolve()
    }

    return chain.then(() => {
      // Trigger pre-run hooks
      this.triggerMethod('before:run')

      // Update status
      this.status = status.running

      // Note the time
      this.internals.timestamps.run = performance.now()

      // Run an element by showing it
      this.triggerMethod('run')

      // Return a promise that is resolved after
      // the element has been run
      return p
    })
  }

  respond(response=null) {
    // Save response
    this.data.response = response

    // Save ideal response and response veracity
    if (this.correctResponse !== null) {
      this.data.correctResponse = this.correctResponse
      this.data.correct =
        this.data.response === this.correctResponse
    }

    // End screen
    this.end('response')
  }

  end(reason=null) {
    // Note the time of and reason for ending
    this.internals.timestamps.end = performance.now()
    this.data.ended_on = reason

    // Update status
    this.status = status.done

    // Cancel the timeout timer
    if (this.timeout !== null) {
      window.clearTimeout(this.internals.timeoutTimer)
    }

    // Complete an element's run and cleanup
    this.triggerMethod('end')

    // A final goodbye once everything is done
    // TODO: This won't work when an element
    // in a sequence is cancelled.
    this.triggerMethod('after:end')
  }

  // Data collection --------------------------------------
  // (the commit method is called automatically if the
  // datacommit option is true, which it is by default)
  commit() {
    // If a data store is defined
    if (this.datastore) {
      // Commit the data collected by this element
      this.datastore.commit(
        // ... plus some additional metadata
        extend(this.data, this.aggregateParameters, {
          sender: this.title,
          sender_type: this.type,
          sender_id: this.id,
          time_run: this.internals.timestamps.run,
          time_end: this.internals.timestamps.end,
          duration: this.internals.timestamps.end -
            this.internals.timestamps.run,
          time_commit: performance.now(),
          timestamp: new Date().toISOString(),
        })
      )
    }
  }

  get timer() {
    switch (this.status) {
      case status.running:
        return performance.now() - this.internals.timestamps.run
      case status.done:
        return this.internals.timestamps.end - this.internals.timestamps.run
      default:
        return undefined
    }
  }

  get parents() {
    let output = []
    let currentElement = this

    // Traverse hierarchy upwards
    while (currentElement.parent) {
      currentElement = currentElement.parent
      output = output.concat(currentElement)
    }

    // Sort in a top-to-bottom order
    return output.reverse()
  }

  get aggregateParameters() {
    return extend(
      {}, ...this.parents.map(o => o.parameters),
      this.parameters
    )
  }

  get type() {
    return [...this.constructor.module, this.constructor.name].join('.')
  }
}

Component.module = ['core']

// Default options ----------------------------------------
// Attributes to pass on to nested items (as names)
export const handMeDowns = [
  'debug',
  'datastore',
  'el',
]

// Simple elements ----------------------------------------
// A DummyElement does nothing and ends
// immediately as soon as it is called
export class Dummy extends Component {
  constructor(options={}) {
    options.timeout = options.timeout || 0
    super(options)
  }
}
