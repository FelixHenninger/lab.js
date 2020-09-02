import { sortBy, omit } from 'lodash'

import { BufferSourceItem, OscillatorItem } from './items/audio'
import { requestIdleCallback } from '../timing'

// Global timeline logic -------------------------------------------------------

export class Timeline {
  controller: any

  events: any

  items: any

  offset: any

  constructor(controller: any, events = []) {
    this.controller = controller
    this.events = events
    this.offset = undefined
  }

  async prepare() {
    const orderedEvents = sortBy(this.events, [
      (e: any) => e.start,
      (e: any) => e.priority,
    ])

    this.items = orderedEvents.map((e: any) => {
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

    return await Promise.all(this.items.map((i: any) => i.prepare()))
  }

  start(offset: any) {
    this.items.forEach((i: any) => i.start(offset))
    this.offset = offset
    requestIdleCallback(() => this.afterStart())
  }

  afterStart() {
    this.items.forEach((i: any) => i.afterStart(this.offset))
  }

  async end(t: any, force = false) {
    return Promise.all(this.items.map((i: any) => i.end(t, force)))
  }

  async teardown() {
    // Not currently populated
  }
}
