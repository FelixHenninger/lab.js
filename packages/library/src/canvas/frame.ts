import { cloneDeep } from 'lodash'

import { Component as BaseComponent } from '../base/component'
import { Component, ComponentOptions } from '../core/component'
import { reduce } from '../util/tree'
import { Screen, canvasDefaults } from './screen'
import { Sequence } from '../flow/sequence'
import { Loop } from '../flow/loop'
import { prepareNested } from '../flow/util/nested'
import { createFragment } from '../html/util/dom'
import { setupCanvas } from './util/dom'

const frameDefaults = {
  context: '<canvas></canvas>',
}

type FrameOptions = ComponentOptions &
  typeof canvasDefaults &
  typeof frameDefaults

export class Frame extends Component {
  constructor(options: Partial<FrameOptions> = {}) {
    super({
      ...cloneDeep(canvasDefaults),
      ...cloneDeep(frameDefaults),
      ...options,
    })

    // Stand-in interator
    this.internals.iterator = {}
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

    // Prepare content
    await prepareNested([this.options.content], this)

    // Prepare iterator
    this.internals.iterator = [this.options.content].entries()
  }

  enterContext(context: object) {
    const c = super.enterContext(context)

    // Attach a canvas and a canvas context
    //@ts-ignore We don't track context data yet
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

  async onRun() {
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
    //@ts-ignore Again, we don't track context content
    context.el = this.internals.outerEl
    //@ts-ignore
    delete context.canvas
    delete this.internals.canvas
    return super.leaveContext(context)
  }
}

Frame.metadata = {
  module: ['canvas'],
  nestedComponents: ['content'],
}
