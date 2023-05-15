import { cloneDeep, isObject } from 'lodash'

import { Component, ComponentOptions } from '../core/component'
import { makeRenderFunction, CanvasContent, Image, AOI } from './util/render'
import { makePathFunction } from './util/path'
import {
  makeTransform,
  makeInverseTransform,
  transform,
} from './util/transform'
import { setupCanvas } from './util/dom'
import { makeProcessEvent } from './util/event'

// Canvas-based components -----------------------------------------------------

export const canvasDefaults = {
  ctxType: '2d',
  insertCanvasOnRun: false,
  // Move origin to canvas center
  translateOrigin: true,
  // Scale a viewport to the entire available space
  viewport: <[number, number]>[800, 600],
  viewportScale: <number | 'auto'>'auto',
  viewportEdge: false,
  // Use high resolution if possible
  devicePixelScaling: undefined, // replaced by true if unspecified
}

const screenDefaults = {
  content: <CanvasContent[]>[],
  renderFunction: <
    | ((
        t: number,
        canvas: HTMLCanvasElement,
        ctx: RenderingContext,
        obj: Component,
      ) => void)
    | null
  >null,
  clearCanvas: true,
}

export type ScreenOptions = ComponentOptions &
  typeof screenDefaults &
  typeof canvasDefaults

export class Screen extends Component {
  options!: ScreenOptions

  constructor(options: Partial<ScreenOptions> = {}) {
    super({
      ...cloneDeep(canvasDefaults),
      ...cloneDeep(screenDefaults),
      ...options,
    })

    // Provide an attribute for tracking redraw requests
    this.internals.frameRequest = null

    // Bind render method
    this.render = this.render.bind(this)
  }

  onPrepare() {
    // Add images to cached media
    ;(this.options.content || [])
      .filter(
        <(c: CanvasContent) => c is Image>(
          (c => isObject(c) && c.type === 'image' && c.src !== undefined)
        ),
      )
      .forEach(c => this.options.media!.images.push(c.src))

    // Prepare AOI event handling
    // Canvas.screen components implement one additional feature
    // compared to any other component, namely the support for AOI
    // filtering on events. In this case, the selector has the format
    // @aoiName, which means we have to rewrite the target to be the
    // current screen canvas, and also add a check to determine whether
    // the event coordinates fall into the AOI region.
    this.internals.domConnection.processEvent = makeProcessEvent(this)

    // Generate generic render function,
    // unless a render function has been defined manually
    if (this.options.renderFunction === null) {
      this.options.renderFunction = makeRenderFunction(
        // Exclude AOIs, and perform at least a rudimentary check
        (this.options.content || []).filter(
          (c: CanvasContent) => isObject(c) && c.type !== 'aoi',
        ),
        this.internals.controller.global.cache,
      )
    }
  }

  enterContext(context: object) {
    const c = super.enterContext(context)

    if ('canvas' in context) {
      // Re-use canvas from surrounding context
      //@ts-ignore we check for the presence of a canvas above
      this.internals.canvas = context.canvas
      this.internals.canvasAdded = false
    } else {
      // Generate local canvas
      this.internals.canvas = document.createElement('canvas')
      this.internals.canvasAdded = true
    }

    // Generate drawing context
    this.internals.ctx = this.internals.canvas.getContext(this.options.ctxType)

    return c
  }

  leaveContext(context: object) {
    // TODO: remove this.internals.canvas and this.internals.ctx
    return super.leaveContext(context)
  }

  onRun() {
    if (this.internals.canvasAdded) {
      // Add canvas to the dom, if necessary
      // TODO: Review performance implications of using innerHTML
      this.internals.context.el.innerHTML = ''
      this.internals.context.el.appendChild(this.internals.canvas)

      // Setup canvas dimensions
      setupCanvas(this.internals.canvas, {
        devicePixelScaling: this.options.devicePixelScaling,
      })
    }

    // Coordinate system translation and scaling -------------------------------
    // Save current transformation state
    this.internals.ctx.save()

    this.internals.transformationMatrix = makeTransform(
      [this.internals.canvas.width, this.internals.canvas.height],
      this.options.viewport,
      {
        translateOrigin: this.options.translateOrigin,
        viewportScale: this.options.viewportScale,
        devicePixelScaling: this.options.devicePixelScaling,
      },
    )

    this.internals.ctx.setTransform(...this.internals.transformationMatrix)
  }

  onRender({ timestamp }: { timestamp: number }) {
    // Clear canvas if requested
    if (this.options.clearCanvas && !this.internals.canvasAdded) {
      this.clear()
    }

    // Draw viewport for debugging purposes
    if (this.options.viewportEdge) {
      this.internals.ctx.save()
      this.internals.ctx.strokeStyle = 'rgb(229, 229, 229)'

      this.internals.ctx.strokeRect(
        this.options.translateOrigin ? -this.options.viewport[0] / 2 : 0,
        this.options.translateOrigin ? -this.options.viewport[1] / 2 : 0,
        this.options.viewport[0],
        this.options.viewport[1],
      )

      this.internals.ctx.restore()
    }

    return this.options.renderFunction!.call(
      this,
      timestamp - this.internals.timestamps.render,
      this.internals.canvas,
      this.internals.ctx,
      this,
    )
  }

  onShow() {
    this.internals.paths = makePathFunction(
      this.options.content.filter(
        <(c: CanvasContent) => c is AOI>(c => c.type === 'aoi'),
      ),
    )(
      // TODO: Update paths
      0,
      this.internals.canvas,
      this.internals.ctx,
    )
  }

  queueAnimationFrame() {
    this.internals.frameRequest = window.requestAnimationFrame(timestamp => {
      if (this.options.clearCanvas) {
        this.clear()
      }

      this.options.renderFunction!.call(
        this,
        timestamp - this.internals.timestamps.render,
        this.internals.canvas,
        this.internals.ctx,
        this,
      )
    })
  }

  onEnd() {
    // Context is extracted in onRun, and may not be present
    // (i.e. if the component is skipped)
    if (this.internals.ctx) {
      // Undo any previously applied tranformations
      this.internals.ctx.restore()
    }
  }

  clear() {
    this.internals.ctx.save()
    this.internals.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.internals.ctx.clearRect(
      0,
      0,
      this.internals.canvas.width,
      this.internals.canvas.height,
    )
    this.internals.ctx.restore()
  }

  transform(coordinates: [number, number]) {
    if (!this.internals.transformationMatrix) {
      throw new Error('No transformation matrix set')
    }

    return transform(this.internals.transformationMatrix, coordinates)
  }

  transformInverse(coordinates: [number, number], fromOffset = false) {
    // Translate from the browser coordinate system back into canvas
    // coordinates. Use either the page origin (with fromOffset=false),
    // or the canvas origin (with fromOffset=true).
    // TODO: Rethink argument names
    if (!this.internals.transformationMatrix) {
      throw new Error('No transformation matrix set')
    }

    // TODO: The inverse tranformation matrix is currently computed
    // on-the-fly, based on the argument that it's not going to be
    // used as frequently, and thus might not be worth generating
    // for every canvas-based screen. This might be wrong, and it's
    // worth thinking about a mechanism that would at least cache
    // the inverse matrix once it's generated.
    const inverseTransformationMatrix = makeInverseTransform(
      [this.internals.canvas.width, this.internals.canvas.height],
      this.options.viewport,
      {
        translateOrigin: this.options.translateOrigin,
        viewportScale: this.options.viewportScale,
        devicePixelScaling: this.options.devicePixelScaling,
        canvasClientRect: this.internals.canvas.getBoundingClientRect(),
        fromOffset,
      },
    )

    return transform(inverseTransformationMatrix, coordinates)
  }

  transformCanvasEvent({ offsetX, offsetY }: MouseEvent) {
    // Translate local event coordinates to canvas coordinate system
    return this.transformInverse([offsetX, offsetY], true)
  }
}

Screen.metadata = {
  module: ['canvas'],
  nestedComponents: [],
  parsableOptions: {
    content: {
      type: 'array',
      content: {
        type: 'object',
        content: {
          text: {},
          fill: {},
          stroke: {},
          strokeWidth: { type: 'number' },
          left: { type: 'number' },
          top: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          angle: { type: 'number' },
          src: {},
          fontSize: { type: 'number' },
        },
      },
    },
  },
}
