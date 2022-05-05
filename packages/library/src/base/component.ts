import { Controller } from './controller'
import { Emitter, EventHandler } from './util/emitter'
import { Plugin, PluginAPI } from './plugin'

import { makeOptionProxy } from './util/options'
import { AbortFlip } from './util/iterators/flipIterable'
import { aggregateParentOption } from './util/hierarchy'
import { rwProxy } from './util/proxy'
import { Row } from '../data/store'

// TODO: Browser switching is a leaky abstraction that assumes
// a client context, and should be revisited
import { browserName } from '../util/browser'

export enum Status {
  initialized,
  prepared,
  running,
  done,
  locked,
}

export enum PublicEventName {
  beforePrepare = 'before:prepare',
  prepare = 'prepare',
  run = 'run',
  render = 'render',
  end = 'end',
  lock = 'lock',
}

enum PrivateEventName {
  beforeRun = 'before:run',
  show = 'show',
  endUncontrolled = 'end:uncontrolled',
}

const EventName = { ...PublicEventName, ...PrivateEventName }
type EventName = PublicEventName | PrivateEventName

export type ComponentOptions = {
  id: string
  title: string
  parameters: any
  files: { [name: string]: string }
  debug: boolean
  skip: boolean
  tardy: boolean
  correctResponse: string
  plugins?: Plugin[]
  hooks?: { [N in EventName]: EventHandler }
  data: any
}

type CoercionType = 'object' | 'array' | 'string' | 'number' | 'boolean'

type ParsableOption = {
  type?: CoercionType
  content?: {
    '*'?: CoercionType | {}
    [key: string]: ParsableOption | string | undefined
  }
  [key: string]: any
}

type Metadata = {
  module: string[]
  nestedComponents: string[]
  parsableOptions?: {
    [key: string]: ParsableOption
  }
}

export class Component {
  id?: string
  options: any
  data: any
  static metadata: Metadata

  state: any
  parameters: any
  internals: any

  parent?: Component
  status: Status

  #emitter: Emitter<EventName>
  on: typeof Emitter.prototype.on
  off: typeof Emitter.prototype.off

  #controller!: Controller

  constructor(options: Partial<ComponentOptions> = {}) {
    const { id, debug } = options

    this.id = id
    this.status = Status.initialized
    this.internals = {}
    this.data = options.data ?? {}

    // Setup emitter and expose via internals
    this.#emitter = new Emitter(id, { debug, context: this })
    this.on = (...args) => this.internals.emitter.on(...args)
    this.off = (...args) => this.internals.emitter.off(...args)
    this.internals.emitter = this.#emitter

    // Setup options
    this.internals.rawOptions = {
      parameters: {},
      files: {},
      ...options,
    }
    const [proxy, arm] = makeOptionProxy(this, this.internals.rawOptions)
    this.options = proxy
    this.internals.armOptions = arm
    this.parameters = rwProxy(
      () => this.aggregateParameters,
      this.options.parameters,
    )
    this.internals.plugins = new PluginAPI<this, EventName>(
      this,
      options.plugins,
    )

    // Setup diagnostics
    this.internals.timestamps = {}
  }

  log(message: string) {
    if (this.options.debug) {
      console.info(`${this.id} (${this.type}): \t ${message}`)
    }
  }

  async prepare(directCall = true) {
    if (this.options.tardy && !directCall) {
      this.log('Skipping automated preparation')
      return
    }

    if (!this.internals.controller) {
      this.#controller = new Controller({ root: this })
      this.internals.controller = this.#controller
    } else if (this.internals.controller && !this.#controller) {
      // Recreate private class field if controller was initialized elsewhere
      // (which is most of the time, in practice, for core.Component instances)
      this.#controller = this.internals.controller
    }

    // Note that we're assuming at this point that the hooks option is
    // fixed at initialization time; later changes won't be reflected in
    // component behavior at this point
    for (const [e, handler] of Object.entries(this.options.hooks ?? {})) {
      this.#emitter.on(e as EventName, handler as EventHandler)
    }

    await this.#emitter.trigger(
      EventName.beforePrepare,
      undefined,
      this.#controller.global,
    )
    this.internals.armOptions()

    // TODO: The preemptive status update is a band-aid fix for
    // underlying logic issues: In combination with the fast-forward
    // logic, applying the status only after preparation led to
    // infinite regressions. This is an issue that should be fixed
    // in the overall design, and not at the symptom level.
    this.status = Status.prepared
    await this.#emitter.trigger(
      EventName.prepare,
      undefined,
      this.#controller.global,
    )
  }

  // Attach and detach context
  enterContext(context: object) {
    this.internals.context = context
    return context
  }

  leaveContext(context: object) {
    // We remove this.internals.context at lock
    return context
  }

  async run({
    controlled = false,
    ...flipData
  }: { controlled?: boolean } = {}) {
    if (this.status < Status.prepared) {
      await this.prepare()
    }

    // Pass control to controller if run() is called directly
    if (!controlled && this.#controller.root === this) {
      return this.#controller.run()
    }

    this.status = Status.running
    this.log('run')

    if (this.options.skip) {
      this.log('skipping')
      this.data.ended_on = 'skipped'
      throw new AbortFlip('Skipping component')
    }

    await this.#emitter.trigger(
      EventName.beforeRun,
      flipData,
      this.#controller.global,
    )
    await this.#emitter.trigger(
      EventName.run,
      flipData,
      this.#controller.global,
    )
  }

  async render(data: object) {
    await this.#emitter.trigger(EventName.render, data, this.#controller.global)
  }
  async show(data: object) {
    await this.#emitter.trigger(EventName.show, data, this.#controller.global)
  }

  async respond(
    response: string,
    { timestamp, action }: { timestamp: number; action: string },
  ) {
    // Save response and the action that generated it
    this.data.response = response
    if (action) {
      this.data.response_action = action
    }

    // Save ideal response and response veracity
    if (this.options.correctResponse !== null) {
      this.data.correctResponse = this.options.correctResponse
      this.data.correct = response === this.options.correctResponse
    }

    // End component
    return this.end('response', { timestamp })
  }

  async end(reason?: string, flipData: any = {}) {
    if (this.status >= Status.done && !flipData.controlled) {
      throw "Can't end previously completed component"
    }

    this.status = Status.done
    this.data.ended_on = this.data.ended_on ?? reason

    // Compute duration
    if (this.data.ended_on === 'timeout') {
      // For timeouts, we can really only know the component's
      // duration after the next component is rendered. We're making
      // a preliminary guess here, and updating it later.
      this.data.duration =
        this.internals.timestamps.end - this.internals.timestamps.render
    } else if (this.data.ended_on === 'response' && browserName === 'Safari') {
      // Safari rAF timestamps are one frame ahead of event timing
      this.data.duration =
        this.internals.timestamps.end - this.internals.timestamps.render
    } else {
      this.data.duration =
        this.internals.timestamps.end -
        (this.internals.timestamps.show || this.internals.timestamps.render)
    }

    if (!flipData.controlled) {
      // Signal end to controller
      return await this.#emitter.emit(EventName.endUncontrolled, flipData)
    } else {
      await this.#emitter.trigger(
        EventName.end,
        flipData,
        this.#controller.global,
      )
    }

    this.internals.logIndex = this.#controller.global.datastore?.set({
      sender: this.options.title,
      sender_type: this.type,
      sender_id: this.id,
      timestamp: new Date().toISOString(),
      time_commit: performance.now(),
      ...this.aggregateParameters,
      ...this.data,
      time_run: this.internals.timestamps.run,
      time_render: this.internals.timestamps.render,
      time_show: this.internals.timestamps.show,
      time_end: this.internals.timestamps.end,
    })
    this.#controller.global.datastore?.commit()

    this.log(`Ending with reason ${flipData.reason}`)
  }

  async lock(data: any = {}) {
    const { timestamp } = data

    this.global.datastore?.update(this.internals.logIndex, (d: Row) => ({
      ...d,
      // Log switch frame
      time_switch: timestamp,
      // If the component was ended by a timeout,
      // update the duration based on the actual presentation time
      duration:
        d.ended_on === 'timeout'
          ? timestamp - (d.time_show! ?? d.time_render!)
          : d.duration,
    }))

    await this.#emitter.trigger(EventName.lock, data, this.#controller.global)
    delete this.internals.context
  }

  // Metadata ------------------------------------------------------------------

  get parents() {
    let output: Array<Component> = []
    let currentComponent: Component = this

    // Traverse hierarchy upwards
    while (currentComponent.parent) {
      currentComponent = currentComponent.parent
      output = output.concat(currentComponent)
    }

    // Sort in a top-to-bottom order
    return output.reverse()
  }

  get progress(): number {
    return this.status >= Status.done ? 1 : 0
  }

  get type() {
    return [
      //@ts-ignore
      ...this.constructor.metadata.module,
      this.constructor.name,
    ].join('.')
  }

  // Aggregated data -----------------------------------------------------------
  get aggregateParameters() {
    return aggregateParentOption(this, 'parameters')
  }

  get files() {
    return aggregateParentOption(this, 'files')
  }

  // Experiment state ----------------------------------------------------------
  get global() {
    if (this.#controller) {
      return this.#controller.global
    } else {
      console.error(
        'Trying to retrieve global state but no controller available',
      )
      return {}
    }
  }
}

Component.metadata = {
  module: ['core'],
  nestedComponents: [],
  parsableOptions: {
    parameters: {
      type: 'object',
      content: {
        '*': {},
      },
    },
    responses: { keys: {}, content: { '*': 'string' } },
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
