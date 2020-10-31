import { cloneDeepWith } from 'lodash'

import { Controller } from './controller'
import { Emitter, EventHandler } from './util/emitter'
import { Plugin, PluginAPI } from './plugin'

import { makeOptionProxy } from './util/options'
import { AbortFlip } from './util/iterators'
import { aggregateParentOption } from './util/hierarchy'
import { rwProxy } from './util/proxy'

export enum Status {
  initialized,
  prepared,
  running,
  done,
  locked,
}

export type ComponentOptions = {
  id: string
  parameters: any
  files: { [name: string]: string }
  debug: boolean
  skip: boolean
  tardy: boolean
  correctResponse: string
  plugins?: Plugin[]
  hooks?: { [event: string]: EventHandler }
  data: any
}

export class Component extends Emitter {
  options: any
  data: any
  static metadata: any

  state: any
  parameters: any
  internals: any

  parent?: Component
  status: Status

  constructor(options: Partial<ComponentOptions> = {}) {
    const { id, debug } = options
    super(id, { debug })

    this.status = Status.initialized
    this.internals = {}
    this.data = options.data ?? {}

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
    this.internals.plugins = new PluginAPI(this, options.plugins)
  }

  log(message: string) {
    if (this.options.debug) {
      console.log(`${this.id} (${this.type}): \t ${message}`)
    }
  }

  async prepare(directCall = true) {
    if (this.options.tardy && !directCall) {
      this.log('Skipping automated preparation')
      return
    }

    if (!this.internals.controller) {
      this.internals.controller = new Controller({ root: this })
    }

    // Note that we're assuming at this point that the hooks option is
    // fixed at initialization time; later changes won't be reflected in
    // component behavior at this point
    for (const [e, handler] of Object.entries(this.options.hooks ?? {})) {
      this.on(e, handler as EventHandler)
    }

    await this.trigger('before:prepare')
    this.internals.armOptions()

    await this.trigger('prepare')
    this.status = Status.prepared
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
    if (!controlled && this.internals.controller.root === this) {
      return this.internals.controller.run()
    }

    this.status = Status.running
    this.log('run')

    if (this.options.skip) {
      this.log('skipping')
      this.data.ended_on = 'skipped'
      throw new AbortFlip('Skipping component')
    }

    await this.trigger('before:run', flipData)
    await this.trigger('run', flipData)
  }

  async render(data: object) {
    await this.trigger('render', data)
  }
  async show(data: object) {
    await this.trigger('show', data)
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

  async end(reason: string | undefined, flipData: any = {}) {
    if (this.status >= Status.done && !flipData.controlled) {
      throw "Can't end previously completed component"
    }

    this.status = Status.done
    this.data.ended_on = this.data.ended_on ?? reason

    if (!flipData.controlled) {
      // Signal end to controller
      return await this.emit('end:uncontrolled', flipData)
    } else {
      await this.trigger('end', flipData)
    }

    this.internals.controller.globals.datastore?.commit({
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

    this.log(`Ending with reason ${flipData.reason}`)
  }

  async lock({ timestamp }: { timestamp: number }) {
    await this.trigger('lock')
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

  // Duplication ---------------------------------------------------------------
  clone(options: any = {}): Component {
    // Return a component of the same type, with identical options
    // We copy all options from the current component,
    // except for those that may contain components
    // themselves -- in that case, we recursively
    // create cloned copies of the original component.
    const nestedComponents =
      (this.constructor as typeof Component).metadata.nestedComponents || []

    const cloneOptions = {
      ...cloneDeepWith(this.internals.rawOptions, (v, k, root) => {
        // Don't clone the datastore
        if (k === 'datastore') {
          return null
        }

        // For immediately nested options that contain components,
        // call their clone method instead of copying naively
        if (
          root === this.internals.rawOptions &&
          nestedComponents.includes(k)
        ) {
          // Choose procedure depending on data type
          if (Array.isArray(v)) {
            // Apply clone method to arrays of components
            return v.map(c => (c instanceof Component ? c.clone() : c))
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
    return new (this.constructor as typeof Component)(cloneOptions)
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
