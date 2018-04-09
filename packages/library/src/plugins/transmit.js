import { uuid4 } from '../util/random'

export default class Transmit {
  constructor(options) {
    this.url = options.url
    this.metadata = options.metadata || {}
    this.metadata.id = this.metadata.id || uuid4()

    // Updates need to be disabled explicitly
    this.updates = {
      staging: !(options.updates && options.updates.staging === false),
      full: !(options.updates && options.updates.full === false),
    }
    this.callbacks = options.callbacks || {}
    this.headers = options.headers || {}
  }

  handle(context, event) {
    const url = this.url
    const metadata = this.metadata

    switch (event) {
      case 'prepare':
        if (this.updates.staging) {
          // Set commit handler on data store
          // (inside the handler, this refers to the store)
          const callback = this.callbacks.staging
          context.options.datastore.on('idle', function() {
            this.transmit(url, metadata, 'latest', { headers: this.headers })
              .then(callback)
          })
        }
        break
      case 'after:end':
        if (this.updates.full) {
          // Transmit the entire data set
          context.options.datastore
            .transmit(url, metadata, 'full', { headers: this.headers })
            .then(this.callbacks.full)
        }
        break
      default:
    }
  }
}
