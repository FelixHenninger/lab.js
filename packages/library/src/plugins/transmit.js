import { uuid4 } from '../util/random/uuid'

export default class Transmit {
  constructor(options={}) {
    this.url = options.url
    this.metadata = options.metadata || {}
    this.metadata.id = this.metadata.id || uuid4()

    // Updates need to be disabled explicitly
    this.updates = {
      incremental: !(options.updates && options.updates.incremental === false),
      full: !(options.updates && options.updates.full === false),
    }
    this.callbacks = options.callbacks || {}
    this.headers = options.headers || {}
    this.encoding = options.encoding || 'json'
  }

  handle(context, event) {
    const { url, metadata } = this

    switch (event) {
      case 'prepare':
        if (this.updates.incremental) {
          // Setup incremental transmission logic
          this.queue = context.options.datastore.transmissionQueue()
          // Set commit handler on data store
          // (inside the handler, this refers to the store)
          context.options.datastore.on('idle', () => {
            this.queue.queueTransmission(
              url,
              { ...metadata, payload: 'incremental' },
              { headers: this.headers, encoding: this.encoding },
            )
          })
        }
        // Trigger setup callback
        if (this.callbacks.setup) {
          this.callbacks.setup.call(this)
        }
        break
      case 'epilogue':
        if (this.updates.full) {
          // Transmit the entire data set
          context.options.datastore
            .transmit(
              url,
              { ...metadata, payload: 'full' },
              { headers: this.headers, encoding: this.encoding },
            ).then((response) => {
              if (this.updates.incremental) {
                context.options.datastore.flushIncrementalTransmissionQueue()
              }
              return response
            }).then(
              this.callbacks.full
            )
        }
        break
      default:
    }
  }
}
