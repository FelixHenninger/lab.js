import { sortBy, omit } from 'lodash'

import { BufferSourceItem, OscillatorItem } from './items/audio'
import { requestIdleCallback } from '../timing'

// Global timeline logic -------------------------------------------------------

export class Timeline {
  constructor(controller, events=[]) {
    this.controller = controller
    this.events = events
    this.offset = undefined
  }

  async prepare() {
    const orderedEvents = sortBy(
      this.events,
      [e => e.start, e => e.priority],
    )

    this.items = orderedEvents.map(e => {
      const options = omit(e, 'payload')

      switch (e.type) {
        case 'sound':
          return new BufferSourceItem(this, options, e.payload)
        case 'oscillator':
          return new OscillatorItem(this, options, e.payload)
        default:
          console.warn(`Unknown event type ${ e.type }, skipping`)
      }
    })

    return await Promise.all(this.items.map(i => i.prepare()))
  }

  start(offset) {
    this.items.forEach(i => i.start(offset))
    this.offset = offset
    requestIdleCallback(() => this.afterStart())
  }

  afterStart() {
    this.items.forEach(i => i.afterStart(this.offset))
  }

  async end(t, force=false) {
    return Promise.all(this.items.map(i => i.end(t, force)))
  }

  async teardown() {
    // Not currently populated
  }
}
