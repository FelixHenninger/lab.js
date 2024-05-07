import { mapValues, cloneDeep } from 'lodash'

import {
  Component as BaseComponent,
  ComponentOptions as BaseComponentOptions,
  ComponentInternals as BaseComponentInternals,
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

type ComponentInternals<C extends BaseComponent> = BaseComponentInternals<C> & {
  controller: Controller
  domConnection: DomConnection
  timeline: Timeline
  timeout?: FrameTimeout
}

const componentDefaults = {
  events: <EventMap>{},
  /** Map from events to their interpretation as a response */
  responses: <{ [eventString: string]: string }>{},
  /** Time to show the component for, in milliseconds */
  timeout: <number | undefined>undefined,
  /** Document element in which to show the component */
  el: <Element | undefined>undefined,
  /** Options to pass to the random number generator */
  random: <RNGOptions | undefined>undefined,
  /** Media to preload in the component */
  media: <Media>{
    images: [],
    audio: [],
  },
  /** Plugins to load with the component */
  plugins: <Plugin[] | undefined>undefined,
  /** Media to show during presentation */
  timeline: <SerializedTimelineItem[]>[],
  /** Whether to scroll to the top of the page when a component is shown */
  scrollTop: false,
  /** Datastore to use for the component (included only for backward
   * compatibility) */
  // Legacy shim
  datastore: <Store | undefined>undefined,
}

export type ComponentOptions = Omit<BaseComponentOptions, 'plugins'> &
  typeof componentDefaults

/**
 * Abstract component implementation
 *
 * The `Component` class represents the basic building block from which
 * `lab.js` studies are constructed. Every component represents part of
 * the experiment at varying levels of granularity -- at the most
 * detailed, individual screens and forms are types of components, but
 * so are sequences and loops that themselves contain further
 * components.
 *
 * The `core.Component` is the most abstract instantiation of the a
 * component -- by itself, it does not do anything (and is not designed
 * to be used directly), but exists to be supplemented with additional
 * behavior to make up the other, more useful, component types.
 * Nonetheless, it can be informative to refer to this class as it
 * contains much of the behavior shown by other components.
 */
export class Component extends BaseComponent {
  options!: ComponentOptions
  internals!: ComponentInternals<Component>

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
  }

  /**
   * Perform all necessary preparations to show a component.
   *
   * This method will, for example, download media files, setup the
   * random number generator, and the like. Importantly, preparation
   * will also resolve component options that are defined via
   * placeholders (containing `${}`) into their final state.
   *
   * This function should not be called directly, but will be run by the
   * overall study logic at an appropriate time. To attach further logic
   * to the preparation, add a callback via `on('prepare', [...])`
   *
   * @param force - Force preparation (if the `tardy` option is set,
   *  a component may defer preparation until it is `run`)
   * @returns
   *
   * @internal
   */
  async prepare(force = true) {
    if (this.options.tardy && !force) {
      this.log('Skipping automated preparation')
      return
    }

    if (!this.internals.controller) {
      //@ts-ignore
      this.internals.controller = new Controller({
        root: this,
        el: this.options.el,
        random: this.options.random,
      })
    }

    // Hook up state from controller
    this.state = this.internals.controller.global.datastore?.state
    this.random = this.internals.controller.createRNG(
      this.id ?? '', // ID is defined only on base.Component ATM
      this.options.random,
    )
    // Create timeline
    this.internals.timeline = new Timeline(
      this.internals.controller,
      this.options.timeline,
    )

    // directCall can only be true at this point
    await super.prepare(force)

    await Promise.all([
      this.global.cache.images.getAll(this.options.media?.images ?? []),
      this.global.cache.audio.getAll(this.options.media?.audio ?? []),
    ])

    // Finalize timeline
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

  /**
   * Run the component
   *
   * Running a component gives it control over the study, for example to
   * show content onscreen and collect responses (in case of a screen),
   * or, in turn to run subordinate components (in case of sequences,
   * loops, and other flow control components)
   *
   * @public
   */
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

  /**
   * Render component
   *
   * If the component provides screen content, show it.
   *
   * @internal
   */
  async render({ timestamp }: { timestamp: number }) {
    this.internals.timestamps.render = timestamp
    // TODO: Revisit which one of these to trigger first
    await super.render({ timestamp })
    this.internals.timeline.start(timestamp + timingParameters.frameInterval)
  }

  /**
   * Indicate that component is fully visible
   *
   * This is largely used for timekeeping, or changing onscreen content
   * directly after it has been rendered.
   *
   * @internal
   */
  async show({ timestamp }: { timestamp: number }) {
    this.internals.timestamps.show = timestamp ?? performance.now()
    await super.show({ timestamp })
    if (this.internals.timeout) {
      this.internals.timeout.run(timestamp)
    }
  }

  /**
   * Stop presentation of component
   *
   * Remove component from ongoing study, tear down connection to
   * document, and move on with the study.
   *
   * @param reason - Reason supplied for ending the component
   *  (typically set internally, e.g. `response` or `timeout`)
   *
   * @public
   */
  async end(reason?: string, flipData: any = {}) {
    if (this.status < Status.running) {
      throw new Error("Trying to end component that's not running yet")
    } else if (this.status > Status.done) {
      throw new Error("Can't end completed component (again)")
    }

    this.internals.domConnection.detach()

    // End timeout
    this.internals.timeout?.cancel()

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

  /**
   * Tear down any remnants of the component
   *
   * Continue the work begun in `.end()` by tearing down all remnants of
   * the component presentation. In particular, remove any reference to
   * elements in the open document so as not to leak memory.
   *
   * @internal
   */
  async lock({ timestamp }: { timestamp: number }) {
    this.internals.timestamps.lock = timestamp
    this.internals.timeline.teardown()
    this.internals.domConnection.teardown()
    this.internals.timeout = undefined
    await super.lock({ timestamp })
    this.status = Status.locked
  }

  /**
   * Shortcut for experiment globals
   */
  get global() {
    return this.internals.controller.global
  }

  // Timekeeping ------------------------------------------
  /**
   * Time since component onset, or, after presentation,
   * total display time
   *
   * The timer will return `undefined` if a component has not yet been
   * shown at all.
   */
  get timer(): number | undefined {
    const timestamps = this.internals.timestamps

    switch (this.status) {
      case Status.running:
      case Status.rendered:
        return performance.now() - (timestamps.show || timestamps.render)
      case Status.done:
      case Status.locked:
        return timestamps.end - (timestamps.show ?? timestamps.run)
      default:
        return undefined
    }
  }
}
