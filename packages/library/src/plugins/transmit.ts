import { Component } from '../base/component'
import { Plugin } from '../base/plugin'
import { uuid4 } from '../util/random/uuid'

type TransmitPluginOptions = {
  url: string
  metadata?: {
    id: string
  }
  updates?: {
    incremental: boolean
    full: boolean
  }
  callbacks?: {
    setup: Function
    full: Function
  }
  headers?: object
  encoding?: 'json' | 'form'
}

export default class Transmit implements Plugin {
  url: string
  metadata: {
    id: string
  }
  updates: {
    incremental: boolean
    full: boolean
  }
  callbacks: {
    setup?: Function
    full?: Function
  }
  headers: object
  encoding: 'json' | 'form'

  // TODO: Implement me
  queue: any

  constructor(options: TransmitPluginOptions) {
    this.url = options.url
    this.metadata = {
      id: options.metadata?.id ?? uuid4(),
      ...options.metadata,
    }

    // Updates need to be disabled explicitly
    this.updates = {
      incremental: options.updates?.incremental !== false,
      full: options.updates?.full !== false,
    }
    this.callbacks = options.callbacks || {}
    this.headers = options.headers || {}
    this.encoding = options.encoding || 'json'
  }

  async handle(context: Component, event: string) {
    const { url, metadata } = this

    switch (event) {
      case 'prepare':
        const controller = context.internals.controller
        const ds = controller.global.datastore

        if (this.updates.incremental) {
          // Setup incremental transmission logic
          this.queue = ds.transmissionQueue()
          // Set commit handler on data store
          // (inside the handler, this refers to the store)
          controller.on('flip', () => {
            this.queue.queueTransmission(
              url,
              { ...metadata, payload: 'incremental' },
              { headers: this.headers, encoding: this.encoding },
            )
          })
        }

        if (this.updates.full) {
          // Transmit the entire data set
          controller.on('end', () => {
            ds.transmit(
              url,
              { ...metadata, payload: 'full' },
              { headers: this.headers, encoding: this.encoding },
            )
              .then((response: Response) => {
                this.queue?.flush()
                return response
              })
              .then(() => this.callbacks.full?.())
          })
        }

        // Trigger setup callback
        if (this.callbacks.setup) {
          this.callbacks.setup.call(this)
        }
        break
      default:
    }
  }
}
