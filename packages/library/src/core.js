import { cloneDeepWith } from 'lodash'
import Proxy from 'es2015-proxy'

import { EventHandler } from './util/eventAPI'
import { DomConnection } from './util/domEvents'
import { Random } from './util/random'
import { parse, parsableOptions, parseRequested } from './util/options'
import { ensureHighResTime, StackTimeout, FrameTimeout,
  requestIdleCallback } from './util/timing'
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
  status = status.initialized // Component status
  data = {} // Collected data

  // Storage for internal properties
  // (these are not supposed to be directly available
  // to users, and may change between versions)
  internals = {
    timestamps: {},
    ...this.internals,
  }

  // Proxy parameters
  // (for browsers that support proxies natively)
  parameters = (window.Proxy
    ? new window.Proxy({}, {
        // Read from the aggregate parameters
        get: (obj, prop) =>
          this.aggregateParameters[prop],
        // Redirect writes to the parameters option
        set: (obj, prop, value) =>
          (this.options.parameters[prop] = value) || true
      })
    : this.aggregateParameters
  )

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

      // Setup timing method
      timing: {
        method: 'frames',
        ...options.timing,
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
    })
    this.on('end', () => {
      this.internals.domConnection.detach()
    })
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

    // Setup console output grouping when the component is run
    if (this.options.debug) {
      this.on('before:run',
        () => console.group(
          `${ this.options.title } %c(${ this.type })`,
          'font-weight: normal'
        ))
      this.on('after:end',
        () => console.groupEnd())
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

    this.internals.parsedOptions = Object.assign(
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
          this.respond(
            this.options.responses[eventString],
            ensureHighResTime(e.timeStamp),
          )
        }
      },
    )
    // Push existing events and el to DomConnection
    this.internals.domConnection.events = this.options.events
    this.internals.domConnection.el = this.options.el

    // Prepare timeout
    if (this.options.timeout !== null) {
      const Timeout = this.options.timing.method === 'frames'
        ? FrameTimeout
        : StackTimeout

      // Add a timeout to end the component automatically
      // after the specified duration.
      this.internals.timeout = new Timeout(
        (timestamp) => this.end('timeout', timestamp, true),
        this.options.timeout,
      )
      this.on('show', (showTimestamp) => {
        this.internals.timeout.run(showTimestamp)
        if (this.options.debug) {
          this.internals.timestamps.timeoutTarget =
            this.internals.timeout.targetTime
        }
      })
    }

    // Preload media
    await Promise.all(this.options.media.images.map(preloadImage))
    await Promise.all(this.options.media.audio.map(preloadAudio))

    // Setup data
    this.data = {
      ...this.data,
      ...this.options.data,
    }

    // Trigger preparation-related methods
    await this.triggerMethod('prepare', directCall)

    // Update status
    this.status = status.prepared

    // Trigger after:prepare event
    await this.triggerMethod('after:prepare')
  }

  async run(frameTimestamp, frameSynced) {
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
      return this.end('skipped', frameTimestamp, frameSynced)
    }

    // Jump to top of page if requested
    if (this.options.scrollTop) {
      window.scrollTo(0, 0)
    }

    // Run a component by showing it
    await this.triggerMethod('run')

    return this.render(frameTimestamp, frameSynced)
  }

  async render(frameTimestamp, frameSynced) {
    // TODO: Think about moving the function
    // declaration out of the render path
    const handler = async (renderFrame) => {
      // Log time
      this.internals.timestamps.render = renderFrame

      // Trigger render logic
      await this.triggerMethod('render', renderFrame)

      // Log next frame time
      window.requestAnimationFrame(showFrame => {
        this.internals.timestamps.show = showFrame
        this.triggerMethod('show', showFrame)
      })
    }

    // Trigger render handler
    if (frameSynced) {
      // ... without waiting for a frame
      handler(frameTimestamp)
    } else {
      // ... or after waiting for a new frame
      this.internals.frameRequest =
        window.requestAnimationFrame(handler)
    }
  }

  respond(response=null, timestamp=undefined) {
    // Save response
    this.data.response = response

    // Save ideal response and response veracity
    if (this.options.correctResponse !== null) {
      this.data.correctResponse = this.options.correctResponse
      this.data.correct =
        this.data.response === this.options.correctResponse
    }

    // End component
    return this.end('response', timestamp)
  }

  async end(reason=null, timestamp=performance.now(), frameSynced=false) {
    // Note the time of and reason for ending
    this.internals.timestamps.end = timestamp
    this.data.ended_on = reason

    // Update status
    this.status = status.done

    // Cancel the timeout timer
    if (this.options.timeout !== null) {
      this.internals.timeout.cancel()
    }

    // Cancel outstanding frame requests
    if (this.internals.frameRequest) {
      window.cancelAnimationFrame(
        this.internals.frameRequest,
      )
    }

    // Complete a component's run and cleanup
    await this.triggerMethod('end', timestamp, frameSynced)

    // Store data (unless instructed otherwise)
    if (this.options.datastore && this.options.datacommit !== false) {
      this.commit({
        ...this.data,
        ...this.aggregateParameters,
        time_run: this.internals.timestamps.run,
        time_render: this.internals.timestamps.render,
        time_show: this.internals.timestamps.show,
        time_end: this.internals.timestamps.end,
        duration: this.data.ended_on === 'timeout'
          // For timeouts, we can really only know the component's
          // duration after the next component is rendered. We're making
          // a preliminary guess here, and updating it later.
          ? this.internals.timestamps.end - this.internals.timestamps.render
          // For responses, the duration can be determined immediately
          : this.internals.timestamps.end - this.internals.timestamps.show
      })
    }

    // A final goodbye once everything is done
    // TODO: This won't work when a component
    // in a sequence is cancelled.
    await this.triggerMethod('after:end', timestamp, frameSynced)

    // Log next frame time
    const switchFrameHandler = (s) => {
      this.internals.timestamps.switch = s

      // Update duration given switch time
      if (this.options.datastore) {
        this.options.datastore.update(
          this.internals.logIndex,
          d => ({
            ...d,
            // Log switch frame
            time_switch: s,
            // If the component was ended by a timeout,
            // update the duration based on the actual presentation time
            duration: d.ended_on === 'timeout'
              ? s - d.time_show
              : d.duration
          })
        )

        // Signal upcoming idle period to data store
        requestIdleCallback(
          () => this.options.datastore.triggerMethod('idle')
        )
      }

      // Queue housekeeping as a final step
      requestIdleCallback(
        () => this.triggerMethod('epilogue')
      )
    }

    if (frameSynced) {
      // If the current event is frame-bound,
      // the switch occurs on the next frame
      window.requestAnimationFrame(switchFrameHandler)
    } else {
      // If the current handler occurs outside
      // of a frame, the next frame is two
      // animation frame callbacks away
      window.requestAnimationFrame(
        () => window.requestAnimationFrame(switchFrameHandler)
      )
    }

    return timestamp
  }

  // Data collection --------------------------------------
  // (the commit method is called automatically if the
  // datacommit option is true, which it is by default)
  commit(data={}) {
    // If a data store is defined
    if (this.options.datastore) {
      const timestamps = this.internals.timestamps
      // Commit the data collected by this component
      this.internals.logIndex = this.options.datastore.commit({
        // ... plus some additional metadata
        ...this.metadata,
        ...data,
        time_commit: performance.now(),
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error('No datastore available to commit to')
    }
    return this.triggerMethod('commit')
  }

  // Timekeeping ------------------------------------------
  get timer() {
    const timestamps = this.internals.timestamps

    switch (this.status) {
      case status.running:
        return performance.now() -
          (timestamps.show || timestamps.render)
      case status.done:
        return this.internals.timestamps.end -
          (timestamps.show || timestamps.run)
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
    return Object.assign({},
      ...this.parents.map(o => o.options.parameters),
      this.options.parameters,
    )
  }

  // Duplication ------------------------------------------
  // Return a component of the same type,
  // with identical options
  clone(options={}) {
    // We copy all options from the current component,
    // except for those that may contain components
    // themselves -- in that case, we recursively
    // create cloned copies of the original component.
    const nestedComponents = this.constructor.metadata.nestedComponents || []

    const cloneOptions = {
      ...cloneDeepWith(this.internals.rawOptions, (v, k, root) => {
        // For immediately nested options that contain components,
        // call their clone method instead of copying naively
        if (root === this.internals.rawOptions &&
          nestedComponents.includes(k)) {

          // Choose procedure depending on data type
          if (Array.isArray(v)) {
            // Apply clone method to arrays of components
            return v.map(
              c => (c instanceof Component ? c.clone() : c),
            )
          } else if (v instanceof Component) {
            // Only clone components, any other data type
            // will be left to the library clone function
            return v.clone()
          }
        }
      }),
      // Overwrite existing options, if so instructed
      ...options,
    }

    // Construct a new component of the same type
    return new this.constructor(cloneOptions)
  }

  // Metadata ---------------------------------------------
  get metadata() {
    return {
      sender: this.options.title,
      sender_type: this.type,
      sender_id: this.options.id,
    }
  }

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
