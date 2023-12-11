import { cloneDeep } from 'lodash'

import { Component as BaseComponent } from '../base/component'
import { Component, ComponentOptions } from '../core/component'
import { reduce } from '../base/util/tree'
import { Screen, canvasDefaults } from './screen'
import { Sequence } from '../flow/sequence'
import { Loop } from '../flow/loop'
import { prepareNested } from '../flow/util/nested'
import { createFragment } from '../html/util/dom'
import { setupCanvas } from './util/dom'
import { CustomIterable } from '../flow/util/iterable'

const frameDefaults = {
  context: '<canvas></canvas>',
}

export type FrameOptions = ComponentOptions &
  typeof canvasDefaults &
  typeof frameDefaults & {
    content: Component | Component[]
  }

export class Frame extends Component {
  declare options: FrameOptions

  constructor(options: Partial<FrameOptions> = {}) {
    super({
      ...cloneDeep(canvasDefaults),
      ...cloneDeep(frameDefaults),
      ...options,
    })

    // Stand-in interator
    this.internals.iterator = CustomIterable.emptyIterator()
  }

  async onPrepare() {
    // Check that all nested components are either flow components
    // or that they use the canvas
    const isFlowOrCanvasBased = (acc: boolean, c: BaseComponent) =>
      acc &&
      (c === this ||
        c instanceof Screen ||
        c instanceof Sequence ||
        c instanceof Loop)

    const canvasBasedSubtree = reduce(this, isFlowOrCanvasBased, true)
    if (!canvasBasedSubtree) {
      throw new Error(
        'canvas.Frame may only contain flow or canvas-based components',
      )
    }

    // Wrap content in array if that is not already so
    const content = Array.isArray(this.options.content)
      ? this.options.content
      : [this.options.content]

    // Prepare content
    await prepareNested(content, this)

    // Prepare iterator
    this.internals.iterator = new CustomIterable(content)[Symbol.iterator]()
  }

  enterContext(context: object) {
    const c = super.enterContext(context)

    // Attach a canvas and a canvas context
    //@ts-expect-error - We don't track context data yet
    this.internals.outerEl = c.el // as HTMLElement
    this.internals.parsedContext = createFragment(this.options.context)
    this.internals.canvas = this.internals.parsedContext.querySelector('canvas')

    if (!this.internals.canvas) {
      throw new Error('No canvas found in canvas.Frame context')
    }

    return {
      ...c,
      canvas: this.internals.canvas,
      el: this.internals.canvas.parentElement ?? this.internals.outerEl,
    }
  }

  onRun() {
    const outerEl = this.internals.outerEl

    // Insert context
    outerEl.innerHTML = ''
    outerEl.appendChild(this.internals.parsedContext)

    // Setup canvas
    setupCanvas(this.internals.canvas, {
      devicePixelScaling: this.options.devicePixelScaling,
    })
  }

  leaveContext(context: object) {
    // TODO: Maybe create a new object and filter instead?
    //@ts-expect-error - Again, we don't track context content
    context.el = this.internals.outerEl
    //@ts-expect-error - LEGACY
    delete context.canvas
    delete this.internals.canvas
    return super.leaveContext(context)
  }
}

Frame.metadata = {
  module: ['canvas'],
  nestedComponents: ['content'],
}
