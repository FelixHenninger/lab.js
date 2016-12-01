import { extend, cloneDeep } from 'lodash'
import { EventHandler } from './util/eventAPI'
import { DomConnection } from './util/domEvents'
import { preloadImage, preloadAudio } from './util/preload'

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

    this.options = {
      // DOM event handlers
      events: {},
      // Component event handlers
      eventHandlers: {},

      // Document node within which
      // the component operates
      el: null,

      // Title of the component as well as
      title: null,
      // Position in the hierarchy
      id: null,
      // Setup 'tardyness'
      tardy: false,
      // Set parent, if defined
      parent: null,

      // Setup parameters
      parameters: {},
      // Setup responses
      responses: {},
      correctResponse: null,

      // Setup data handling
      data: {},
      datastore: null,
      datacommit: null,

      // There is no timeout by default
      timeout: null,

      ...this.options,
    }

    // Setup a storage for internal properties
    // (these are not supposed to be directly
    // available to users, and will not be
    // documented in detail)
    this.internals = {
      timestamps: {},
      ...this.internals,
    }

    // Component status
    this.status = status.initialized

    // Setup media handling
    this.options.media = {
      images: [],
      audio: [],
      ...this.options.media,
    }

    // Setup additional data
    this.data = {}

    // Attach component event handlers
    Object.keys(this.options.eventHandlers).forEach(
      event => this.on(event, this.options.eventHandlers[event]),
    )

    // Add a DomConnection that connects
    // DOM events to internal handlers
    this.internals.domConnection = new DomConnection({
      el: this.options.el,
      context: this,
    })
    this.on('run', () => {
      this.internals.domConnection.attach()
      this.triggerMethod('after:event:init')
    })
    this.on('end', () => {
      this.internals.domConnection.detach()
      this.triggerMethod('after:event:remove')
    })

    // Setup console output grouping
    // when the component is run
    if (this.options.debug) {
      this.on('before:run', () => console.group(this.type))
      this.on('after:end', () => console.groupEnd())
    }
  }

  // Actions ----------------------------------------------
  async prepare(directCall=true) {
    // Prepare a component prior to its display,
    // for example by pre-loading or pre-rendering
    // content

    // Skip the remainder of the function if the
    // prepare call was automated and the component
    // is labeled as tardy
    if (this.options.tardy && !directCall) {
      if (this.options.debug) {
        console.log('Skipping automated preparation')
      }
      return
    }

    // Direct output to the HTML element with the id
    // 'labjs-content', unless a different element
    // has been provided explicitly
    if (this.options.debug && this.options.el == null) {
      console.log('No output element specified, using #labjs-content')
    }
    this.options.el = this.options.el || document.getElementById('labjs-content')

    // Trigger the before:prepare event
    await this.triggerMethod('before:prepare')

    // Setup automatic event handling for responses
    Object.keys(this.options.responses).forEach(
      (eventString) => {
        this.options.events[eventString] = () => {
          // Trigger internal response handling
          this.respond(this.options.responses[eventString])
        }
      },
    )
    // Push existing events and el to DomConnection
    this.internals.domConnection.events = this.options.events
    this.internals.domConnection.el = this.options.el

    // Prepare timeout
    if (this.options.timeout !== null) {
      // Add a timeout to end the component
      // automatically after the specified
      // duration.
      this.on('run', () => {
        this.internals.timeoutTimer = window.setTimeout(
          () => this.end('timeout'),
          this.options.timeout,
        )
      })
    }

    // Setup data storage
    // (unless it has been explicitly disabled)
    if (this.options.datastore && this.options.datacommit !== false) {
      this.options.datacommit = true
      this.on('after:end', this.commit)
    }

    // Preload media
    await Promise.all(this.options.media.images.map(preloadImage))
    await Promise.all(this.options.media.audio.map(preloadAudio))

    // Setup data
    this.data = {
      ...this.data,
      ...this.options.data,
    }

    // Trigger related methods
    await this.triggerMethod('prepare', directCall)

    // Update status
    this.status = status.prepared

    // TODO: Need to reflect on the order of the last
    // two operations. A problem emerged that calls
    // to 'run' in a prepare handler would lead to
    // double preparation, therefore the current order
    // was chosen. However, this might be revised
    // at some later point for clearer semantics.
  }

  async run() {
    // Prepare component if this has not been done
    if (this.status < status.prepared) {
      if (this.options.debug) {
        console.log('Preparing at the last minute')
      }
      await this.prepare()
    }

    // Trigger pre-run hooks
    await this.triggerMethod('before:run')

    // Update status
    this.status = status.running

    // Note the time
    this.internals.timestamps.run = performance.now()

    // Run a component by showing it
    return this.triggerMethod('run')
  }

  respond(response=null) {
    // Save response
    this.data.response = response

    // Save ideal response and response veracity
    if (this.options.correctResponse !== null) {
      this.data.correctResponse = this.options.correctResponse
      this.data.correct =
        this.data.response === this.options.correctResponse
    }

    // End screen
    return this.end('response')
  }

  async end(reason=null) {
    // Note the time of and reason for ending
    this.internals.timestamps.end = performance.now()
    this.data.ended_on = reason

    // Update status
    this.status = status.done

    // Cancel the timeout timer
    if (this.options.timeout !== null) {
      window.clearTimeout(this.internals.timeoutTimer)
    }

    // Complete a component's run and cleanup
    await this.triggerMethod('end')

    // A final goodbye once everything is done
    // TODO: This won't work when a component
    // in a sequence is cancelled.
    await this.triggerMethod('after:end')
  }

  // Data collection --------------------------------------
  // (the commit method is called automatically if the
  // datacommit option is true, which it is by default)
  commit() {
    // If a data store is defined
    if (this.options.datastore) {
      // Commit the data collected by this component
      this.options.datastore.commit(
        // ... plus some additional metadata
        // TODO: Decide whether the data attribute should
        // be extended, or whether the extension here should
        // start from an empty object
        extend({}, this.data, this.aggregateParameters, {
          sender: this.options.title,
          sender_type: this.type,
          sender_id: this.options.id,
          time_run: this.internals.timestamps.run,
          time_end: this.internals.timestamps.end,
          duration: this.internals.timestamps.end -
            this.internals.timestamps.run,
          time_commit: performance.now(),
          timestamp: new Date().toISOString(),
        }),
      )
    }
  }

  // Timekeeping ------------------------------------------
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

  // Progress ---------------------------------------------
  get progress() {
    return (this.status === status.done) * 1
  }

  // Parameters -------------------------------------------
  get aggregateParameters() {
    return extend(
      {}, ...this.parents.map(o => o.options.parameters),
      this.options.parameters,
    )
  }

  // Duplication ------------------------------------------
  // Return a component of the same type,
  // with identical options
  clone(options={}) {
    return new this.constructor({
      ...cloneDeep(this.options),
      ...options,
    })
  }

  // Metadata ---------------------------------------------
  get parents() {
    let output = []
    let currentComponent = this

    // Traverse hierarchy upwards
    while (currentComponent.parent) {
      currentComponent = currentComponent.parent
      output = output.concat(currentComponent)
    }

    // Sort in a top-to-bottom order
    return output.reverse()
  }

  get type() {
    return [
      ...this.constructor.metadata.module,
      this.constructor.name
    ].join('.')
  }
}

Component.metadata = {
  module: ['core'],
  nestedComponents: [],
}

// Default options ----------------------------------------
// Attributes to pass on to nested items (as names)
export const handMeDowns = [
  'debug',
  'datastore',
  'el',
]

// Simple components --------------------------------------
// A Dummy component does nothing but end
// immediately as soon as it is called
export class Dummy extends Component {
  constructor(options={}) {
    super(options)
    this.options = {
      timeout: 0,
      ...this.options,
    }
  }
}
