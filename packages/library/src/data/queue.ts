import { Store } from './store'
import { debounceAsync } from '../util/network'

export class TransmissionQueue {
  lastTransmission: number = 0
  queueTransmission

  constructor(store: Store, interval: number = 2500) {
    this.queueTransmission = debounceAsync(
      async (url: string, metadata = {}, options = {}) => {
        // Trigger transmission
        const promise = store.transmit(url, metadata, {
          slice: [this.lastTransmission, undefined],
          ...options,
        })

        // Take note of how much data got transmitted
        this.lastTransmission = store.data.length

        // Wait until transmission completes
        return await promise
      },
      interval,
    )
  }

  flush() {
    this.queueTransmission.flush()
  }

  cancel() {
    this.queueTransmission.cancel()
  }
}
