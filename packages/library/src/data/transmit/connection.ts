import { Store } from '../store'
import { debounceAsync } from './debounce'
import { transmit } from './transmit'

export class Connection {
  #store: Store
  #url: string

  #metadata: object
  #headers: object
  #encoding: 'json' | 'form'

  // Transmission state
  #queueTransmission
  #lastTransmission: number = 0

  constructor(
    store: Store,
    url: string,
    {
      metadata = {},
      headers = {},
      encoding = 'json',
      debounceInterval = 2500,
    }: {
      metadata?: object
      headers?: object
      encoding?: 'json' | 'form'
      debounceInterval?: number
    } = {},
  ) {
    this.#store = store
    this.#url = url
    this.#metadata = metadata
    this.#headers = headers
    this.#encoding = encoding

    this.#queueTransmission = debounceAsync(async () => {
      // Trigger transmission
      const promise = transmit(
        this.#url, //
        this.#store.data,
        { ...this.#metadata, payload: 'incremental' },
        {
          headers: this.#headers,
          encoding: this.#encoding,
          slice: [this.#lastTransmission, undefined],
        },
      )

      // Take note of how much data got transmitted
      this.#lastTransmission = this.#store.data.length

      // Wait until transmission completes
      return await promise
    }, debounceInterval)
  }

  async enqueue() {
    return this.#queueTransmission()
  }

  async transmit() {
    this.#queueTransmission.flush()
    return transmit(
      this.#url,
      this.#store.data,
      { ...this.#metadata, payload: 'full' },
      { headers: this.#headers, encoding: this.#encoding },
    )
  }

  async finalize() {
    await this.#queueTransmission.flush()
  }

  drop() {
    this.#queueTransmission.cancel()
  }

  get lastTransmission() {
    return this.#lastTransmission
  }
}
