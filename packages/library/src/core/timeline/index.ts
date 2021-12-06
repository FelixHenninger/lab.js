import { sortBy, omit } from 'lodash'

import { BufferSourceItem, OscillatorItem } from './items/audio'
import { requestIdleCallback } from '../timing/shims'
import { Controller } from '../controller'

// Global timeline logic -------------------------------------------------------

type AbstractSerializedItem = {
  type: string
  payload: any
  start: number
  stop: number
  gain: number
  pan: number
  rampUp: number
  rampDown: number
  priority: number
}

type SerializedSound = AbstractSerializedItem & {
  type: 'sound'
  payload: {
    src: string
    loop: boolean
  }
}

type SerializedOscillator = AbstractSerializedItem & {
  type: 'oscillator'
  payload: {
    type: 'sine' | 'square' | 'sawtooth' | 'triangle'
    frequency: number
    detune: number
  }
}

export type SerializedItem = SerializedSound | SerializedOscillator
type Item = BufferSourceItem | OscillatorItem

export class Timeline {
  controller: Controller
  serializedItems: SerializedItem[]
  items!: Item[]
  offset?: number

  constructor(controller: Controller, serializedItems: SerializedItem[] = []) {
    this.controller = controller
    this.serializedItems = serializedItems
    this.offset = undefined
  }

  async prepare() {
    const orderedItems = sortBy(this.serializedItems, [
      e => e.start,
      e => e.priority,
    ])

    this.items = orderedItems
      .map(e => {
        const options = omit(e, 'payload')

        switch (e.type) {
          case 'sound':
            return new BufferSourceItem(this, options, e.payload)
          case 'oscillator':
            return new OscillatorItem(this, options, e.payload)
          default:
            throw new Error(`Unknown item type on ${e}`)
        }
      })
      .filter(i => i !== undefined)

    return await Promise.all(this.items.map(i => i.prepare()))
  }

  start(offset: number) {
    this.items.forEach(i => i.start(offset))
    this.offset = offset
    requestIdleCallback(() => this.afterStart())
  }

  afterStart() {
    this.items.forEach(i => i.afterStart(this.offset!))
  }

  async end(t: number, force = false) {
    return Promise.all(this.items.map(i => i.end(t, force)))
  }

  async teardown() {
    // Not currently populated
  }
}
