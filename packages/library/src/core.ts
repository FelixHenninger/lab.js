import { cloneDeepWith } from 'lodash'
import Proxy from 'es2015-proxy'

import { Store } from './data'
import { EventHandler } from './util/eventAPI'
import { Timeline } from './util/timeline'
import { DomConnection } from './util/domEvents'
import { Random } from './util/random'
import { parse, parsableOptions, parseRequested } from './util/options'
import {
  ensureHighResTime,
  timingParameters,
  StackTimeout,
  FrameTimeout,
  requestIdleCallback,
} from './util/timing'
import { awaitReadyState } from './util/readyState'
import { ImageCache, AudioCache } from './util/cache'
import { browserName } from './util/browser'
import { aggregateParentOption } from './util/tree'
import { ComponentOptions, ComponentMetadata } from './types'

// Define status codes
export const status = Object.freeze({
  initialized: 0,
  prepared: 1,
  running: 2,
  done: 3,
})

// Default options ----------------------------------------
// Attributes to pass on to nested items (as names)
export const handMeDowns = ['debug', 'el']

// Controller: Coordinates overall study state ------------
class Controller {
  audioContext: any

  cache: any

  datastore: any

  domConnection: any

  metadata: ComponentMetadata

  constructor() {
    // Data storage
    this.datastore = new Store()

    // Audio context
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'webkitAudioContext' does not exist on ty... Remove this comment to see the full error message
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // Media cache
    this.cache = {
      images: new ImageCache(),
      audio: new AudioCache(this.audioContext),
    }

    // Setup DOM connection for global events
    this.domConnection = new DomConnection({
      el: document,
      context: this,
    })
    this.domConnection.events = {
      // Capture user interactions to indicate activity
      keydown: this.indicateInteraction,
      mousedown: this.indicateInteraction,
      touchstart: this.indicateInteraction,
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
  options: ComponentOptions

  random: any

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
  parameters =
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'BUILD_FLAVOR'.
    BUILD_FLAVOR !== 'legacy'
      ? new window.Proxy(
          {},
          {
            // Read from the aggregate parameters
            get: (obj: any, prop: any) => this.aggregateParameters[prop],
            // Redirect writes to the parameters option
            set: (obj: any, prop: any, value: any) => {
              if (this.options.parameters) {
                this.options.parameters[prop] = value
                return true
              }
              throw new Error('No parameters to add to')
            },
            has: (obj: any, prop: any) =>
              Reflect.has(this.aggregateParameters, prop),
            ownKeys: (target) => Reflect.ownKeys(this.aggregateParameters),
            getOwnPropertyDescriptor: (obj: any, prop: any) =>
              Reflect.getOwnPropertyDescriptor(this.aggregateParameters, prop),
          },
        )
      : undefined

  // Proxy state
  state =
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'BUILD_FLAVOR'.
    BUILD_FLAVOR !== 'legacy'
      ? new window.Proxy(
          {},
          {
            // Read from the internal datastore
            // TODO: This would likely benefit from optional chaining,
            // plus some way of removing the repetition
            // in all of these traps.
            get: (obj: any, prop: any) => {
              if (this.options.datastore) {
                return this.options.datastore.state[prop]
              }
              throw new Error('No datastore to read state from')
            },
            // Redirect writes to store's set method
            set: (obj: any, prop: any, value: any) => {
              if (this.options.datastore) {
                this.options.datastore.set(prop, value)
                return true
              }
              throw new Error('No datastore to save state to')
            },
            has: (obj: any, prop: any) => {
              if (this.options.datastore) {
                return Reflect.has(this.options.datastore.state, prop)
              }
              throw new Error('No datastore to read state from')
            },
            ownKeys: (obj: any) => {
              if (this.options.datastore) {
                return Reflect.ownKeys(this.options.datastore.state)
              }
              throw new Error('No datastore to read state from')
            },
            getOwnPropertyDescriptor: (obj: any, prop: any) => {
              if (this.options.datastore) {
                return Reflect.getOwnPropertyDescriptor(
                  this.options.datastore.state,
                  prop,
                )
              }
              throw new Error('No datastore to read state from')
            },
          },
        )
      : undefined

  // Proxy files
  files =
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'BUILD_FLAVOR'.
    BUILD_FLAVOR !== 'legacy'
      ? new window.Proxy(
          {},
          {
            // Read from the aggregate parameters
            get: (obj: any, prop: any) => this._aggregateFiles[prop],
            // Redirect writes to the files option
            set: (obj: any, prop: any, value: any) => {
              if (this.options.files) {
                this.options.files[prop] = value
                return true
              }
              throw new Error('No parameters to add to')
            },
            has: (obj: any, prop: any) =>
              Reflect.has(this._aggregateFiles, prop),
            ownKeys: (target) => Reflect.ownKeys(this._aggregateFiles),
            getOwnPropertyDescriptor: (obj: any, prop: any) =>
              Reflect.getOwnPropertyDescriptor(this._aggregateFiles, prop),
          },
        )
      : undefined

  constructor(options: ComponentOptions = {}) {
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
      handMeDowns: [...handMeDowns],

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
      get: (target: any, key: any) => this.internals.parsedOptions[key],
      set: (target: any, key: any, value: any) => {
        // Always set the raw value
        this.internals.rawOptions[key] = value

        // Once the component has been prepared,
        // parse all options as they are set
        if (this.status >= status.prepared) {
          const candidate = parse(
            value,
            {
              parameters: this.aggregateParameters,
              state: this.options.datastore.state,
              files: this._aggregateFiles,
              random: this.random,
            },
            parsableOptions(this)[key],
            this,
          )

          if (candidate !== value) {
            this.internals.parsedOptions[key] = candidate
          }
        }

        // Acknowledge success
        return true
      },
    })

    // Attach component event handlers
    Object.keys(this.options.messageHandlers).forEach((event) =>
      this.on(event, this.options.messageHandlers[event]),
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

  async prepare(directCall = true): Promise<void> {
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
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'parent' does not exist on type 'Componen... Remove this comment to see the full error message
    if (this.parent) {
      this.parents
        .reduce(
          // Accumulate handed down options from parents
          (acc, cur) => {
            cur.options.handMeDowns.forEach((o: any) => acc.add(o))
            return acc
          },
          new Set(),
        )
        .forEach(
          // 'inherit' the option from the parent component
          (o: any) => {
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'parent' does not exist on type 'Componen... Remove this comment to see the full error message
            this.options[o] = this.options[o] || this.parent.options[o]
          },
          // TODO: This mechanism, though elegant, is not flawless:
          // If options are set to valid values by default,
          // then cannot be inherited because the option is
          // provided anyhow, and won't be overridden.
        )
    }

    // Initialize controller
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'parent' does not exist on type 'Componen... Remove this comment to see the full error message
    if (this.parent && this.parent.internals.controller) {
      // Inherit controller from parent internals
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'parent' does not exist on type 'Componen... Remove this comment to see the full error message
      this.internals.controller = this.parent.internals.controller
    } else {
      this.internals.controller = new Controller()
      // Wait for the page to load completely before finishing preparation
      this.once('after:prepare', awaitReadyState)
    }

    // Connect datastore from controller
    this.options.datastore = this.internals.controller.datastore

    // Create timeline
    this.internals.timeline = new Timeline(this.internals.controller)

    // Setup console output grouping when the component is run
    if (this.options.debug) {
      this.on('before:run', () =>
        console.group(
          `${this.options.title} %c(${this.type})`,
          'font-weight: normal',
        ),
      )
      this.on('after:end', () => console.groupEnd())
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
      random: this.random,
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
    Object.keys(this.options.responses).forEach((eventString) => {
      this.options.events[eventString] = (e: any) => {
        // Prevent default browser response
        e.preventDefault()
        // Trigger internal response handling
        this.respond(
          this.options.responses[eventString],
          {
            timestamp: ensureHighResTime(e.timeStamp),
            action: eventString,
          })
        
      }
    })

    // Push existing events and el to DomConnection
    this.internals.domConnection.events = this.options.events
    this.internals.domConnection.el = this.options.el

    // Prepare timeout
    if (this.options.timeout !== null) {
      const Timeout =
        this.options.timing.method === 'frames' ? FrameTimeout : StackTimeout

      // Add a timeout to end the component automatically
      // after the specified duration.
      this.internals.timeout = new Timeout(
        (timestamp: number) => this.end('timeout', timestamp, true),
        this.options.timeout,
      )
      this.on('show', (showTimestamp: any) => {
        this.internals.timeout.run(showTimestamp)
        if (this.options.debug) {
          this.internals.timestamps.timeoutTarget = this.internals.timeout.targetTime
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

    // Prepare timeline
    this.internals.timeline.events = this.options.timeline
    await this.internals.timeline.prepare()

    // Prepare DOM connections
    this.internals.domConnection.prepare()

    // Trigger after:prepare event
    await this.triggerMethod('after:prepare')
  }

  async preload(): Promise<void> {
    // Preload media

    await Promise.all([
      this.internals.controller.cache.images.getAll(this.options.media.images),
      this.internals.controller.cache.audio.getAll(this.options.media.audio),
    ])
  }

  async run(
    frameTimestamp?: number,
    frameSynced?: boolean,
  ): Promise<number | void> {
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

  async render(frameTimestamp: number, frameSynced: boolean): Promise<void> {
    // TODO: Think about moving the function
    // declaration out of the render path

    const handler = async (renderFrame: any) => {
      // Log time
      this.internals.timestamps.render = renderFrame

      // Trigger render logic and timeline
      await this.triggerMethod('render', renderFrame)
      this.internals.timeline.start(
        renderFrame + timingParameters.frameInterval,
      )

      // Log next frame time
      this.internals.showFrameRequest = window.requestAnimationFrame(showFrame => {
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
      this.internals.frameRequest = window.requestAnimationFrame(handler)
    }
  }

  respond(response=null, { timestamp, action }={}) {
    // Save response and the action that generated it
    this.data.response = response
    if (action) {
      this.data.response_action = action
    }

    // Save ideal response and response veracity
    if (this.options.correctResponse !== null) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'correctResponse' does not exist on type ... Remove this comment to see the full error message
      this.data.correctResponse = this.options.correctResponse
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'correct' does not exist on type ... Remove this comment to see the full error message
      this.data.correct = response === this.options.correctResponse
    }

    // End component
    return this.end('response', timestamp)
  }

  async end(
    reason = null,
    timestamp = performance.now(),
    frameSynced = false,
  ): Promise<number> {
    // Note the time of and reason for ending
    this.internals.timestamps.end = timestamp
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ended_on' does not exist on type '{}'.
    this.data.ended_on = reason

    // Update status
    this.status = status.done

    // Cancel the timeout timer
    if (this.options.timeout !== null) {
      this.internals.timeout.cancel()
    }

    // Cancel outstanding frame requests
    if (this.internals.frameRequest) {
      window.cancelAnimationFrame(this.internals.frameRequest)
    }
    if (this.internals.showFrameRequest) {
      window.cancelAnimationFrame(
        this.internals.showFrameRequest,
      )
    }

    // Compute duration
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ended_on' does not exist on type '{}'.
    if (this.data.ended_on === 'timeout') {
      // For timeouts, we can really only know the component's
      // duration after the next component is rendered. We're making
      // a preliminary guess here, and updating it later.
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'duration' does not exist on type '{}'.
      this.data.duration =
        this.internals.timestamps.end - this.internals.timestamps.render
    } else if (
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'ended_on' does not exist on type '{}'.
      this.data.ended_on === 'response' &&
      browserName === 'Safari'
    ) {
      // Safari rAF timestamps are one frame ahead of event timing
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'duration' does not exist on type '{}'.
      this.data.duration =
        this.internals.timestamps.end - this.internals.timestamps.render
    } else {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'duration' does not exist on type '{}'.
      this.data.duration = this.internals.timestamps.end -
        (this.internals.timestamps.show || this.internals.timestamps.render)
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
    const switchFrameHandler = (s: any) => {
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
            ? s - (d.time_show || d.time_render)
            : d.duration
        }),
      )

      // Signal upcoming idle period to data store
      requestIdleCallback(() => this.options.datastore.triggerMethod('idle'))

      // Queue housekeeping as a final step
      requestIdleCallback(() => this.epilogue())
    }

    if (frameSynced) {
      // If the current event is frame-bound,
      // the switch occurs on the next frame
      window.requestAnimationFrame(switchFrameHandler)
    } else {
      // If the current handler occurs outside
      // of a frame, the next frame is two
      // animation frame callbacks away
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(switchFrameHandler),
      )
    }

    return timestamp
  }

  epilogue(): void {
    this.internals.timeline.teardown()
    this.internals.domConnection.teardown()
    this.triggerMethod('epilogue')
  }

  // Data collection --------------------------------------
  // (the commit method is called automatically if the
  // datacommit option is true, which it is by default)
  commit(data = {}): Promise<void> {
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
  get timer(): number {
    const { timestamps } = this.internals

    switch (this.status) {
      case status.running:
        return performance.now() - (timestamps.show || timestamps.render)
      case status.done:
        return (
          this.internals.timestamps.end - (timestamps.show || timestamps.run)
        )
      default:
        return undefined
    }
  }

  // Progress ---------------------------------------------
  get progress(): number {
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    return (this.status === status.done) * 1
  }

  // Parameters -------------------------------------------
  // TODO: Update with parameter type
  get aggregateParameters(): { [key: string]: any } {
    return aggregateParentOption(this, 'parameters')
  }

  // Files ------------------------------------------------
  // (in contrast to aggregateParameters, this is not
  // intended for public use, and thus starts with an
  // underscore)
  get _aggregateFiles(): { [key: string]: string } {
    return aggregateParentOption(this, 'files')
  }

  // Duplication ------------------------------------------
  // Return a component of the same type,
  // with identical options
  clone(options = {}): Component {
    // We copy all options from the current component,
    // except for those that may contain components
    // themselves -- in that case, we recursively
    // create cloned copies of the original component.
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'metadata' does not exist on type 'Functi... Remove this comment to see the full error message
    const nestedComponents = this.constructor.metadata.nestedComponents || []

    const cloneOptions = {
      ...cloneDeepWith(
        this.internals.rawOptions,
        (v: any, k: any, root: any) => {
          // For immediately nested options that contain components,
          // call their clone method instead of copying naively
          if (
            root === this.internals.rawOptions &&
            nestedComponents.includes(k)
          ) {
            // Choose procedure depending on data type
            if (Array.isArray(v)) {
              // Apply clone method to arrays of components
              return v.map((c) => (c instanceof Component ? c.clone() : c))
            }
            if (v instanceof Component) {
              // Only clone components, any other data type
              // will be left to the library clone function
              return v.clone()
            }
          }
        },
      ),
      // Overwrite existing options, if so instructed
      ...options,
    }

    // Construct a new component of the same type
    // @ts-expect-error ts-migrate(2351) FIXME: Type 'Function' has no construct signatures.
    return new this.constructor(cloneOptions)
  }

  // Metadata ---------------------------------------------
  get id(): (string | number)[] {
    // Experimental id splitting support
    return this.options.id.split('_').map((x) => parseInt(x) || x)
  }

  get metadata() {
    return {
      sender: this.options.title,
      sender_type: this.type,
      sender_id: this.options.id,
    }
  }

  get parents() {
    let output: any = []
    let currentComponent = this

    // Traverse hierarchy upwards
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'parent' does not exist on type 'Componen... Remove this comment to see the full error message
    while (currentComponent.parent) {
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'parent' does not exist on type 'Componen... Remove this comment to see the full error message
      currentComponent = currentComponent.parent
      output = output.concat(currentComponent)
    }

    // Sort in a top-to-bottom order
    return output.reverse()
  }

  // @ts-expect-error 'type' is defined as a property in class 'EventHandler', but is overridden here in 'Component' as an accessor.
  get type() {
    return [
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'metadata' does not exist on type 'Functi... Remove this comment to see the full error message
      ...this.constructor.metadata.module,
      this.constructor.name,
    ].join('.')
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'metadata' does not exist on type 'typeof... Remove this comment to see the full error message
Component.metadata = {
  module: ['core'],
  nestedComponents: [],
  parsableOptions: {
    parameters:      {
      type: 'object',
      content: {
        '*': {},
      },
    },
    responses:       { keys: {}, content: { '*': 'string' } },
    correctResponse: {},
    timeline: {
      type: 'array',
      content: {
        type: 'object',
        content: {
          start: { type: 'number' },
          stop: { type: 'number' },
          '*': 'string',
          payload: {
            type: 'object',
            content: {
              gain: { type: 'number' },
              loop: { type: 'boolean' },
              '*': 'string',
            },
          },
        },
      },
    },
    timeout: { type: 'number' },
    skip: { type: 'boolean' },
  },
}

// Simple components --------------------------------------
// A Dummy component does nothing but end
// immediately as soon as it is called
export class Dummy extends Component {
  constructor(options = {}) {
    super({
      skip: true,
      ...options,
    })
  }
}
