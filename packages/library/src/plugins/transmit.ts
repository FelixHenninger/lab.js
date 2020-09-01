import { uuid4 } from '../util/random'

export default class Transmit {
  callbacks: any;
  encoding: any;
  headers: any;
  metadata: any;
  updates: any;
  url: any;
  constructor(options={}) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'url' does not exist on type '{}'.
    this.url = options.url
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'metadata' does not exist on type '{}'.
    this.metadata = options.metadata || {}
    this.metadata.id = this.metadata.id || uuid4()

    // Updates need to be disabled explicitly
    this.updates = {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'updates' does not exist on type '{}'.
      incremental: !(options.updates && options.updates.incremental === false),
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'updates' does not exist on type '{}'.
      full: !(options.updates && options.updates.full === false),
    }
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'callbacks' does not exist on type '{}'.
    this.callbacks = options.callbacks || {}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'headers' does not exist on type '{}'.
    this.headers = options.headers || {}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'encoding' does not exist on type '{}'.
    this.encoding = options.encoding || 'json'
  }

  handle(context: any, event: any) {
    const { url, metadata } = this

    switch (event) {
      case 'prepare':
        if (this.updates.incremental) {
          // Set commit handler on data store
          // (inside the handler, this refers to the store)
          context.options.datastore.on('idle', function() {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.queueIncrementalTransmission(
              url,
              { ...metadata, payload: 'incremental' },
              // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
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
            ).then((response: any) => {
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
