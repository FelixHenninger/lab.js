import { mapValues, cloneDeep } from 'lodash'

import {
  Component as BaseComponent,
  ComponentOptions as BaseComponentOptions,
  Status,
} from '../base/component'
import { Plugin } from '../plugins'
import { Store } from '../data'
import { Random, RNGOptions } from '../util/random'
import { Controller } from './controller'
import { DomConnection, EventMap } from './events/index'
import { Timeline, SerializedItem as SerializedTimelineItem } from './timeline'
import { FrameTimeout, timingParameters } from './timing/timeout'

type Media = {
  images: string[]
  audio: string[]
}

const componentDefaults = {
  events: <EventMap>{},
  responses: <{ [eventString: string]: string }>{},
  timeout: <number | undefined>undefined,
  el: <Element | undefined>undefined,
  random: <RNGOptions | undefined>undefined,
  media: <Media>{
    images: [],
    audio: [],
  },
  plugins: <Plugin[] | undefined>undefined,
  timeline: <SerializedTimelineItem[]>[],
  scrollTop: false,
  // Legacy shim
  datastore: <Store | undefined>undefined,
}

export type ComponentOptions = Omit<BaseComponentOptions, 'plugins'> &
  typeof componentDefaults

export class Component extends BaseComponent {
  options!: ComponentOptions
  state: any
  events!: EventMap
  random!: Random

  parent?: Component

  constructor(options: Partial<ComponentOptions> = {}) {
    super({
      ...cloneDeep(componentDefaults),
      ...options,
      //@ts-ignore Not sure why this doesn't work
      media: {
        images: [],
        audio: [],
        ...(options?.media ?? {}),
      },
    })

    this.internals.domConnection = new DomConnection({ context: this })
    this.internals.timestamps = {}
  }

  async prepare(directCall = true) {
    if (this.options.tardy && !directCall) {
      this.log('Skipping automated preparation')
      return
    }

    if (!this.internals.controller) {
      this.internals.controller = new Controller({
        root: this,
        el: this.options.el,
      })
    }

    // Hook up state from controller
    this.state = this.internals.controller.global.datastore?.state
    this.random = new Random(this.options.random)
    // Create timeline
    this.internals.timeline = new Timeline(this.internals.controller)

    // directCall can only be true at this point
    await super.prepare(directCall)

    await Promise.all([
      this.global.cache.images.getAll(this.options.media?.images ?? []),
      this.global.cache.audio.getAll(this.options.media?.audio ?? []),
    ])

    // Finalize timeline
    this.internals.timeline.events = this.options.timeline
    await this.internals.timeline.prepare()

    // Prepare timeout
    if (this.options.timeout) {
      // Add a timeout to end the component automatically
      // after the specified duration.
      this.internals.timeout = new FrameTimeout(
        (t: number) => this.end('timeout', { timestamp: t, frameSynced: true }),
        this.options.timeout,
      )
    }

    const responseEvents = mapValues(
      this.options.responses,
      (response: string, eventString: string) => (e: Event) => {
        // Prevent default browser response
        e.preventDefault()
        // Trigger internal response handling
        this.respond(response, {
          timestamp: e.timeStamp,
          action: eventString,
        })
      },
    )

    this.internals.domConnection.events = {
      ...responseEvents,
      ...this.options.events,
    }
    this.internals.domConnection.prepare()
  }

  async run({
    controlled = false,
    ...flipData
  }: { controlled?: boolean } = {}) {
    // Skip actual content if so instructed
    if (this.options.scrollTop && controlled) {
      window.scrollTo(0, 0)
    }

    // TODO: Check/ensure flip timestamp availability
    this.internals.timestamps.run =
      (flipData as any)?.timestamp ?? performance.now()

    await super.run({ controlled, ...flipData })

    if (controlled) {
      // TODO: Define this earlier
      this.internals.domConnection.el = this.internals.context.el
      this.internals.domConnection.attach()
    }
  }

  async render({ timestamp }: { timestamp: number }) {
    this.internals.timestamps.render = timestamp
    // TODO: Revisit which one of these to trigger first
    await super.render({ timestamp })
    this.internals.timeline.start(timestamp + timingParameters.frameInterval)
  }

  async show({ timestamp }: { timestamp: number }) {
    this.internals.timestamps.show = timestamp ?? performance.now()
    await super.show({ timestamp })
    if (this.internals.timeout) {
      this.internals.timeout.run(timestamp)
    }
  }

  async end(reason?: string, flipData: any = {}) {
    this.internals.domConnection.detach()

    // End timeout
    if (this.options.timeout) {
      this.internals.timeout.cancel()
    }

    // End the timeline (without waiting)
    this.internals.timeline.end(
      flipData.timestamp + timingParameters.frameInterval,
    )

    // FIXME: Check/ensure flip timestamp availability,
    // and clarify timestamp flow following response- or timeout-triggered end
    // Maybe this should only run on uncontrolled passes?
    this.internals.timestamps.end =
      this.internals.timestamps.end ??
      flipData?.timestamp ??
      flipData?.frameTimestamp ??
      performance.now()

    await super.end(reason, flipData)
  }

  async lock({ timestamp }: { timestamp: number }) {
    this.internals.timestamps.lock = timestamp
    this.internals.timeline.teardown()
    this.internals.domConnection.teardown()
    await super.lock({ timestamp })
    this.status = Status.locked
  }

  get global() {
    return this.internals.controller.global
  }

  // Timekeeping ------------------------------------------
  get timer(): number | undefined {
    const timestamps = this.internals.timestamps

    switch (this.status) {
      case Status.running:
        return performance.now() - (timestamps.show || timestamps.render)
      case Status.done:
      case Status.locked:
        return timestamps.end - (timestamps.show ?? timestamps.run)
      default:
        return undefined
    }
  }
}
