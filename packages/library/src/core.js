import { extend, cloneDeep } from 'lodash'
import Proxy from 'es2015-proxy'

import { EventHandler } from './util/eventAPI'
import { DomConnection } from './util/domEvents'
import { Random } from './util/random'
import { parse, parsableOptions, parseRequested } from './util/options'
import { preloadImage, preloadAudio } from './util/preload'

// Define status codes
export const status = Object.freeze({
  initialized:  0,
  prepared:     1,
  running:      2,
  done:         3,
})

// Default options ----------------------------------------
// Attributes to pass on to nested items (as names)
export const handMeDowns = [
  'debug',
  'datastore',
  'el',
]

// Generic building block for experiment
export class Component extends EventHandler {
  constructor(options={}) {
    // Construct the EventHandler first
    super({
      // DOM event handlers
      events: {},
      // Component event handlers
      messageHandlers: {},

      // Document node within which
      // the component operates
      el: null,

      // Title of the component as well as
      title: null,
      // Position in the hierarchy
      id: null,
      // Setup 'tardyness'
      tardy: false,
      // Skip if so desired
      skip: false,
      // Scroll to top if requested
      scrollTop: false,
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

      // Setup PRNG
      random: {},

      // There is no timeout by default
      timeout: null,

      // Setup hand-me-downs
      // (array is copied on purpose)
      handMeDowns: [
        ...handMeDowns,
      ],

      ...options,

      // Setup media handling
      media: {
        images: [],
        audio: [],
        ...options.media,
      },
    })

    // Setup option proxying
    this.internals.parsedOptions = Object.create(this.internals.rawOptions)
    this.options = new Proxy(this.internals.rawOptions, {
      get: (target, key) => this.internals.parsedOptions[key],
      set: (target, key, value) => {
        // Always set the raw value
        this.internals.rawOptions[key] = value

        // Once the component has been prepared,
        // parse all options as they are set
        if (this.status >= status.prepared) {
          const candidate = parse(value, {
            parameters: this.aggregateParameters,
            state: this.options.datastore ? this.options.datastore.state : {},
          }, parsableOptions(this)[key], this)

          if (candidate !== value) {
            this.internals.parsedOptions[key] = candidate
          }
        }

        // Acknowledge success
        return true
      },
    })

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

    // Setup additional data
    this.data = {}

    // Attach component event handlers
    Object.keys(this.options.messageHandlers).forEach(
      event => this.on(event, this.options.messageHandlers[event]),
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

    // Collect options 'handed down' from higher-level components
    if (this.parent) {
      this.parents.reduce(
        // Accumulate handed down options from parents
        (acc, cur) => {
          cur.options.handMeDowns.forEach(o => acc.add(o))
          return acc
        },
        new Set(),
      ).forEach(
        // 'inherit' the option from the parent component
        (o) => { this.options[o] = this.options[o] || this.parent.options[o] },
        // TODO: This mechanism, though elegant, is not flawless:
        // If options are set to valid values by default,
        // then cannot be inherited because the option is
        // provided anyhow, and won't be overridden.
      )
    }

    // Direct output to the HTML element with the attribute
    // data-labjs-section="main", unless a different element
    // has been provided explicitly
    if (this.options.debug && this.options.el == null) {
      console.log('No output element specified, using main section')
    }
    this.options.el =
      this.options.el || document.querySelector('[data-labjs-section="main"]')

    // Save reference to topmost component in the hierarchy
    this.internals.root = this.parents[0]

    // Setup PRNG
    this.random = new Random(this.options.random)

    // Trigger the before:prepare event
    await this.triggerMethod('before:prepare')

    // Parse raw options using template insertion data
    const parsedOptions = parseRequested(
      this.internals.rawOptions,
      {
        parameters: this.aggregateParameters,
        state: this.options.datastore ? this.options.datastore.state : {},
      },
      parsableOptions(this),
      this,
    )

    this.internals.parsedOptions = extend(
      Object.create(this.internals.rawOptions),
      parsedOptions,
    )

    // Setup automatic event handling for responses
    Object.keys(this.options.responses).forEach(
      (eventString) => {
        this.options.events[eventString] = (e) => {
          // Prevent default browser response
          e.preventDefault()
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

    // Skip actual content if so instructed
    if (this.options.skip) {
      return this.end('skipped')
    }

    // Jump to top of page if requested
    if (this.options.scrollTop) {
      window.scrollTo(0, 0)
    }

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
    return this.triggerMethod('commit')
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
    const rawOptions = this.internals.rawOptions

    // Copy local options
    const cloneOptions = {
      ...cloneDeep(rawOptions),
      ...options,
    }

    // Clone any nested components
    this.constructor.metadata.nestedComponents.forEach((o) => {
      if (Array.isArray(rawOptions[o])) {
        cloneOptions[o] = rawOptions[o].map(
          c => (c instanceof Component ? c.clone() : c),
        )
      } else if (rawOptions[o] instanceof Component) {
        // Only clone components, any other data type
        // will have already been copied above.
        cloneOptions[0] = rawOptions[o].clone()
      }
    })

    // Create new component of the same type
    return new this.constructor(cloneOptions)
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
      this.constructor.name,
    ].join('.')
  }
}

Component.metadata = {
  module: ['core'],
  nestedComponents: [],
  parsableOptions: {
    correctResponse: {},
    timeout:         { type: 'number' },
  },
}

// Simple components --------------------------------------
// A Dummy component does nothing but end
// immediately as soon as it is called
export class Dummy extends Component {
  constructor(options={}) {
    super({
      skip: true,
      ...options,
    })
  }
}
