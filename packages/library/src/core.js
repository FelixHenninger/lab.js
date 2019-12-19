import { cloneDeepWith } from 'lodash'
import Proxy from 'es2015-proxy'

import { Store } from './data'
import { EventHandler } from './util/eventAPI'
import { Timeline } from './util/timeline'
import { DomConnection } from './util/domEvents'
import { Random } from './util/random'
import { parse, parsableOptions, parseRequested } from './util/options'
import { ensureHighResTime, timingParameters,
  StackTimeout, FrameTimeout,
  requestIdleCallback } from './util/timing'
import { awaitReadyState } from './util/readyState'
import { preloadImage, preloadAudio } from './util/preload'
import { browserName } from './util/browser'
import { aggregateParentOption } from './util/tree'

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
  'el',
]

// Controller: Coordinates overall study state ------------
class Controller {
  constructor() {
    // Data storage
    this.datastore = new Store()

    // Media cache
    this.cache = {
      images: {},
      audio: {},
    }

    // Audio context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // Setup DOM connection for global events
    this.domConnection = new DomConnection({
      el: document,
      context: this,
    })
    this.domConnection.events = {
      // Capture user interactions to indicate activity
      'keydown': this.indicateInteraction,
      'mousedown': this.indicateInteraction,
      'touchstart': this.indicateInteraction,
    }
    this.domConnection.prepare()
    this.domConnection.attach()
    // TODO: This doesn't seem optimal;
    // there must be a better point to capture events
  }

  async indicateInteraction() {
    // Unlock AudioContext if necessary
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    // Remove registered events
    this.domConnection.detach()
  }
}

// Component: Generic building block for experiment -------
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
  parameters = (BUILD_FLAVOR !== 'legacy'
    ? new window.Proxy({}, {
        // Read from the aggregate parameters
        get: (obj, prop) =>
          this.aggregateParameters[prop],
        // Redirect writes to the parameters option
        set: (obj, prop, value) =>
          (this.options.parameters[prop] = value) || true,
        has: (obj, prop) =>
          Reflect.has(this.aggregateParameters, prop),
        ownKeys: (obj, prop) =>
          Reflect.ownKeys(this.aggregateParameters),
        getOwnPropertyDescriptor: (obj, prop) =>
          Reflect.getOwnPropertyDescriptor(
            this.aggregateParameters, prop
          ),
      })
    : undefined
  )

  // Proxy state
  state = (BUILD_FLAVOR !== 'legacy'
    ? new window.Proxy({}, {
        // Read from the internal datastore
        // TODO: This would likely benefit from optional chaining,
        // plus some way of removing the repetition
        // in all of these traps.
        get: (obj, prop) => {
          if (this.options.datastore) {
            return this.options.datastore.state[prop]
          } else {
            throw new Error('No datastore to read state from')
          }
        },
        // Redirect writes to store's set method
        set: (obj, prop, value) => {
          if (this.options.datastore) {
            this.options.datastore.set(prop, value)
            return true
          } else {
            throw new Error('No datastore to save state to')
          }
        },
        has: (obj, prop) => {
          if (this.options.datastore) {
            return Reflect.has(this.options.datastore.state, prop)
          } else {
            throw new Error('No datastore to read state from')
          }
        },
        ownKeys: (obj) => {
          if (this.options.datastore) {
            return Reflect.ownKeys(this.options.datastore.state)
          } else {
            throw new Error('No datastore to read state from')
          }
        },
        getOwnPropertyDescriptor: (obj, prop) => {
          if (this.options.datastore) {
            return Reflect.getOwnPropertyDescriptor(
              this.options.datastore.state, prop
            )
          } else {
            throw new Error('No datastore to read state from')
          }
        },
      })
    : undefined
  )

  // Proxy files
  files = (BUILD_FLAVOR !== 'legacy'
    ? new window.Proxy({}, {
        // Read from the aggregate parameters
        get: (obj, prop) =>
          this._aggregateFiles[prop],
        // Redirect writes to the parameters option
        set: (obj, prop, value) =>
          (this.options.files[prop] = value) || true,
        has: (obj, prop) =>
          Reflect.has(this._aggregateFiles, prop),
        ownKeys: (obj, prop) =>
          Reflect.ownKeys(this._aggregateFiles),
        getOwnPropertyDescriptor: (obj, prop) =>
          Reflect.getOwnPropertyDescriptor(
            this._aggregateFiles, prop
          ),
      })
    : undefined
  )

  constructor(options={}) {
    // Construct the EventHandler first
    super({
      // DOM event handlers
      events: {},
      // Component event handlers
      messageHandlers: {},
      // Timeline
      timeline: [],

      // Document node within which
      // the component operates
      el: null,
      // Setup study controller
      controller: null,

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
      // Setup file handling
      // (which will replace media at some time)
      files: {
        ...options.files,
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
            state: this.options.datastore.state,
            files: this._aggregateFiles,
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

    // Initialize controller
    if (this.parent && this.parent.internals.controller) {
      // Inherit controller from parent internals
      this.internals.controller = this.parent.internals.controller
    } else {
      this.internals.controller = new Controller()
      // Wait for the page to load completely before finishing preparation
      this.once('after:prepare', awaitReadyState)
    }

    // Connect datastore from controller
    this.options.datastore = this.internals.controller.datastore

    // Create timeline
    this.internals.timeline = new Timeline(
      this.internals.controller,
    )

    // Setup console output grouping when the component is run
    if (this.options.debug) {
      this.on('before:run',
        () => console.group(
          `${ this.options.title } %c(${ this.type })`,
          'font-weight: normal',
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
    const templateContext = Object.freeze({
      parameters: this.aggregateParameters,
      state: this.options.datastore.state,
      files: this._aggregateFiles,
    })

    const parsedOptions = parseRequested(
      this.internals.rawOptions,
      templateContext,
      parsableOptions(this),
      templateContext,
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

    // Prepare timeline
    this.internals.timeline.events = this.options.timeline
    this.internals.timeline.prepare()

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
        timestamp => this.end('timeout', timestamp, true),
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

    // Setup data
    this.data = {
      ...this.data,
      ...this.options.data,
    }

    // Trigger preparation-related methods
    await this.triggerMethod('prepare', directCall)

    // Update status
    this.status = status.prepared

    // Preload media
    await this.preload()

    // Prepare DOM connections
    this.internals.domConnection.prepare()

    // Trigger after:prepare event
    await this.triggerMethod('after:prepare')
  }

  async preload() {
    // Preload media
    await Promise.all(
      this.options.media.images.map(
        img => preloadImage(img,
          this.internals.controller.cache.images
        )
      )
    )
    await Promise.all(
      this.options.media.audio.map(
        snd => preloadAudio(snd,
          this.internals.controller.cache.audio,
          this.internals.controller.audioContext,
        )
      )
    )
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
    await this.triggerMethod('run', frameTimestamp, frameSynced)

    return this.render(frameTimestamp, frameSynced)
  }

  async render(frameTimestamp, frameSynced) {
    // TODO: Think about moving the function
    // declaration out of the render path
    const handler = async (renderFrame) => {
      // Log time
      this.internals.timestamps.render = renderFrame

      // Trigger render logic and timeline
      await this.triggerMethod('render', renderFrame)
      this.internals.timeline.start(
        renderFrame + timingParameters.frameInterval
      )

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

    // Compute duration
    if (this.data.ended_on === 'timeout') {
      // For timeouts, we can really only know the component's
      // duration after the next component is rendered. We're making
      // a preliminary guess here, and updating it later.
      this.data.duration = this.internals.timestamps.end -
        this.internals.timestamps.render
    } else if (
      this.data.ended_on === 'response' && browserName === 'Safari'
    ) {
      // Safari rAF timestamps are one frame ahead of event timing
      this.data.duration = this.internals.timestamps.end -
        this.internals.timestamps.render
    } else {
      this.data.duration = this.internals.timestamps.end -
        this.internals.timestamps.show
    }

    // Complete a component's run and cleanup
    await this.triggerMethod('end', timestamp, frameSynced)

    // End the timeline (without waiting)
    this.internals.timeline.end(timestamp + timingParameters.frameInterval)

    // Store data (unless instructed otherwise)
    if (this.options.datacommit !== false) {
      this.commit({
        ...this.aggregateParameters,
        ...this.data,
        time_run: this.internals.timestamps.run,
        time_render: this.internals.timestamps.render,
        time_show: this.internals.timestamps.show,
        time_end: this.internals.timestamps.end,
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
        }),
      )

      // Signal upcoming idle period to data store
      requestIdleCallback(
        () => this.options.datastore.triggerMethod('idle')
      )

      // Queue housekeeping as a final step
      requestIdleCallback(
        () => this.epilogue()
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

  epilogue() {
    this.internals.timeline.teardown()
    this.internals.domConnection.teardown()
    this.triggerMethod('epilogue')
  }

  // Data collection --------------------------------------
  // (the commit method is called automatically if the
  // datacommit option is true, which it is by default)
  commit(data={}) {
    // Commit the data collected by this component ...
    this.internals.logIndex = this.options.datastore.commit({
      // ... plus some additional metadata
      ...this.metadata,
      ...data,
      time_commit: performance.now(),
      timestamp: new Date().toISOString(),
    })
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
    return aggregateParentOption(this, 'parameters')
  }

  // Files ------------------------------------------------
  // (in contrast to aggregateParameters, this is not
  // intended for public use, and thus starts with an
  // underscore)
  get _aggregateFiles() {
    return aggregateParentOption(this, 'files')
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
  get id() {
    // Experimental id splitting support
    return this.options.id
      .split('_')
      .map(x => parseInt(x) || x)
  }

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
    responses:       { content: { '*': 'string' } },
    correctResponse: {},
    timeline:        {
      type: 'array',
      content: {
        'type': 'object',
        'content': {
          'start':         { type: 'number' },
          'stop':          { type: 'number' },
          '*':             'string',
          'payload':       {
            type: 'object',
            content:       {
              'gain':      { type: 'number' },
              'loop':      { type: 'boolean' },
              '*':         'string',
            },
          },
        },
      },
    },
    timeout:         { type: 'number' },
    skip:            { type: 'boolean' },
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
