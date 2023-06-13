import { Component } from '../core/component'
import { Plugin } from '../base/plugin'
import { uuid4 } from '../util/random/uuid'
import { transmit } from '../data/transmit/transmit'
import { Store } from '../data'
import { Connection } from '../data/transmit/connection'

export type TransmitPluginOptions = {
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
  #url: string
  #metadata: {
    id: string
  }
  #updates: {
    incremental: boolean
    full: boolean
  }
  callbacks: {
    setup?: Function
    full?: Function
  }
  headers: object
  encoding: 'json' | 'form'

  connection?: Connection

  constructor(options: TransmitPluginOptions) {
    this.#url = options.url
    this.#metadata = {
      id: options.metadata?.id ?? uuid4(),
      ...options.metadata,
    }

    // Updates need to be disabled explicitly
    this.#updates = {
      incremental: options.updates?.incremental !== false,
      full: options.updates?.full !== false,
    }
    this.callbacks = options.callbacks || {}
    this.headers = options.headers || {}
    this.encoding = options.encoding || 'json'
  }

  async handle(context: Component, event: string) {
    switch (event) {
      case 'prepare':
        const controller = context.internals.controller
        const ds = controller.global.datastore

        // Setup incremental transmission logic
        this.connection = new Connection(ds, this.#url, {
          metadata: this.#metadata,
          headers: this.headers,
          encoding: this.encoding,
        })

        if (this.#updates.incremental) {
          // Set commit handler on data store
          // (inside the handler, this refers to the store)
          controller.on('flip', () => this.connection?.enqueue())
        }

        if (this.#updates.full) {
          // Transmit the entire data set
          controller.on('end', () =>
            Promise.all([
              this.connection?.transmit(),
              this.connection?.finalize(),
            ]).then(() => this.callbacks.full?.()),
          )
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
