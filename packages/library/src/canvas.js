// Canvas-based displays for lab.js
import { isObject } from 'lodash'

import { Component } from './core'
import { Sequence as BaseSequence, Loop, Parallel,
  prepareNested } from './flow'
import { Frame as BaseFrame } from './html'
import { reduce } from './util/tree'
import { makeRenderFunction, makePathFunction,
  makeTransform, makeInverseTransform, transform } from './util/canvas'

// Global canvas functions used in all of the following components
// (multiple inheritance would come in handy here, but alas...)

// TODO: Rethink handling of the this binding
// in the following code, and refactor if necessary.
// (code is clean, but not necessarily as elegant
// as possible)

const addCanvasDefaults = function addCanvasDefaults(options) {
  // Setup canvas handling:
  // By default, the component does not
  // come bundled with a canvas. Instead,
  // the expectation is that it will receive
  // a canvas by the time it is prepared,
  // otherwise the component will take care of
  // creating its own canvas and appending
  // it to the dom at runtime.
  // Either way, a canvas is definitely present
  // after the component is prepared.
  return {
    canvas: null,
    ctxType: '2d',
    ctx: null,
    insertCanvasOnRun: false,
    // Move origin to canvas center
    translateOrigin: true,
    // Scale a viewport to the entire available space
    viewport: [800, 600],
    viewportScale: 'auto',
    viewportEdge: false,
    // Use high resolution if possible
    devicePixelScaling: null, // replaced by true if unspecified
    ...options,
  }
}

const prepareCanvas = function prepareCanvas() {
  // Initialize a canvas,
  // if this has not already been done
  if (this.options.canvas === null) {
    this.options.canvas = document.createElement('canvas')
    // Remember to add the canvas to the DOM later
    this.options.insertCanvasOnRun = true
  }

  // Setup resolution scaling
  if (this.options.devicePixelScaling === null) {
    this.options.devicePixelScaling = true
  }
}

const insertCanvas = function insertCanvas(
  clearElement=true,
  wrapper
) {
  // Add the canvas to the DOM if need be
  if (this.options.insertCanvasOnRun) {
    // Calculate scaling factor necessary for full resolution rendering
    const pixelRatio = this.options.devicePixelScaling
      ? window.devicePixelRatio
      : 1

    // Styles are calculated relative to the canvas'
    // parent element
    wrapper = wrapper || this.options.el

    // Remove all other content within the HTML tag
    // (note that this could be sped up, as per
    // http://jsperf.com/innerhtml-vs-removechild
    // it seems sufficient for the moment, though)
    if (clearElement) {
      wrapper.innerHTML = ''
    }

    // Calculate available space, accounting for padding around the canvas
    const wrapperStyle = window.getComputedStyle(wrapper)

    // TODO: The call to getComputedStyle above, as well as
    // and the width and height calculations here, cause
    // layout reflow. Think about providing an option to
    // disable this (the user would then have to fix the
    // canvas width and height manually via CSS)
    const width = wrapper.clientWidth -
      parseInt(wrapperStyle.paddingLeft) - parseInt(wrapperStyle.paddingRight)
    const height = wrapper.clientHeight -
      parseInt(wrapperStyle.paddingTop) - parseInt(wrapperStyle.paddingBottom)

    // Adjust the (internal) canvas dimensions
    // to match the physical screen pixels
    this.options.canvas.width = width * pixelRatio
    this.options.canvas.height = height * pixelRatio

    // Display as block so that dimensions apply exactly
    this.options.canvas.style.display = 'block'

    // Set the canvas element dimensions to match the available space
    this.options.canvas.style.width = `${ width }px`
    this.options.canvas.style.height = `${ height }px`

    // Append the canvas to the DOM
    if (clearElement) {
      wrapper.appendChild(this.options.canvas)
    }
  }
}

// Canvas-based components -----------------------------------------------------

export class Screen extends Component {
  constructor(options={}) {
    super({
      content: null,
      renderFunction: null,
      clearCanvas: true,
      ...addCanvasDefaults(options),
    })

    // Provide an attribute for tracking
    // redraw requests
    this.internals.frameRequest = null

    // Bind render method
    this.render = this.render.bind(this)
  }

  onPrepare() {
    // Add images to cached media
    (this.options.content || [])
      .filter(c => isObject(c) && c.type === 'image' && c.src)
      .forEach(c => this.options.media.images.push(c.src))

    prepareCanvas.apply(this)

    // Prepare AOI event handling
    // Canvas.screen components implement one additional
    // feature compared to any other component, namely the
    // support for AOI filtering on events. In this case,
    // the selector has the format @aoiName, which means
    // we have to rewrite the target to be the current
    // screen canvas, and also add a check to determine
    // whether the event coordinates fall into the AOI region.
    this.internals.domConnection.processEvent =
      ([eventName, filters, selector]) => {
        // TODO: Split multiple selectors
        if (selector && selector.startsWith('@')) {
          // Calculate applied pixel ratio
          const pixelRatio = this.options.devicePixelScaling
            ? window.devicePixelRatio
            : 1

          if (['mouseenter', 'mouseleave'].includes(eventName)) {
            const makeCheckFunc = function(initial=true, rising=true) {
              // Buffer last result
              let lastResult = initial

              return function checkFunc(e, context) {
                const checkResult = context.options.ctx.isPointInPath(
                  context.internals.paths[selector.slice(1)],
                  e.offsetX * pixelRatio,
                  e.offsetY * pixelRatio
                )

                // Detect edge
                const output = rising
                  ? !lastResult && checkResult
                  : lastResult && !checkResult

                // Save last result
                lastResult = checkResult

                return output
              }
            }

            const checkFunc = eventName == 'mouseenter'
              ? makeCheckFunc(true, true)
              : makeCheckFunc(false, false)

            // Return modified event
            return {
              eventName: 'mousemove', filters,
              selector: 'canvas',
              moreChecks: [checkFunc],
            }
          } else {
            // Return modified event
            return {
              eventName, filters,
              selector: 'canvas',
              moreChecks: [
                e => this.options.ctx.isPointInPath(
                  this.internals.paths[selector.slice(1)],
                  e.offsetX * pixelRatio,
                  e.offsetY * pixelRatio
                )
              ],
            }
          }

        } else {
          // Return unmodified event, following default behavior
          return { eventName, filters, selector }
        }
      }

    // Generate generic render function,
    // unless a render function has been defined manually
    // TODO: This should probably not be the default.
    //   Instead, in a future release, there should probably
    //   be a BaseScreen class that accepts a manually defined
    //   render function. Alternatively, a more advanced class
    //   should be created that includes the generic render
    //   function
    if (this.options.renderFunction === null) {
      this.options.renderFunction =
        makeRenderFunction(
          // Exclude AOIs, and perform at least a rudimentary check
          (this.options.content || [])
            .filter(c => isObject(c) && c.type !== 'aoi'),
          this.internals.controller.cache,
        )
    }
  }

  onRun() {
    // Add canvas to the dom, if necessary
    insertCanvas.apply(this)

    // Extract the requested context for the canvas
    this.options.ctx = this.options.canvas.getContext(
      this.options.ctxType,
    )

    // Coordinate system translation and scaling -------------------------------

    // Save current transformation state
    this.options.ctx.save()

    this.internals.transformationMatrix = makeTransform(
      [this.options.canvas.width, this.options.canvas.height],
      this.options.viewport,
      {
        translateOrigin: this.options.translateOrigin,
        viewportScale: this.options.viewportScale,
        devicePixelScaling: this.options.devicePixelScaling,
      },
    )

    this.options.ctx.setTransform(...this.internals.transformationMatrix)
  }

  onRender(timestamp) {
    // Clear canvas if requested
    // TODO: This should check if the canvas is fresh,
    // and not run if it isn't necessary
    if (this.options.clearCanvas) {
      this.clear()
    }

    // Draw viewport for debugging purposes
    if (this.options.viewportEdge) {
      this.options.ctx.save()
      this.options.ctx.strokeStyle = 'rgb(229, 229, 229)'

      this.options.ctx.strokeRect(
        this.options.translateOrigin ? -this.options.viewport[0] / 2 : 0,
        this.options.translateOrigin ? -this.options.viewport[1] / 2 : 0,
        this.options.viewport[0],
        this.options.viewport[1],
      )

      this.options.ctx.restore()
    }

    return this.options.renderFunction.call(
      this, // context
      timestamp - this.internals.timestamps.render, // arguments ...
      this.options.canvas,
      this.options.ctx,
      this,
    )
  }

  onShow() {
    this.internals.paths = makePathFunction(this.options.content || [])(
      // TODO: Update paths
      0, this.options.canvas, this.options.ctx
    )
  }

  queueAnimationFrame() {
    this.internals.frameRequest = window.requestAnimationFrame(
      timestamp => {
        if (this.options.clearCanvas) {
          this.clear()
        }

        this.options.renderFunction.call(
          this, // context
          timestamp - this.internals.timestamps.render, // arguments ...
          this.options.canvas,
          this.options.ctx,
          this,
        )
      }
    )
  }

  onEnd() {
    // Context is extracted in onRun, and may not be present
    // (i.e. if the component is skipped)
    if (this.options.ctx) {
      // Undo any previously applied tranformations
      this.options.ctx.restore()
    }
  }

  onEpilogue() {
    // Dereference canvas and context
    delete this.options.ctx
    delete this.options.canvas
  }

  clear() {
    this.options.ctx.save()
    this.options.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.options.ctx.clearRect(
      0, 0, this.options.canvas.width, this.options.canvas.height,
    )
    this.options.ctx.restore()
  }

  transform(coordinates) {
    if (!this.internals.transformationMatrix) {
      throw new Error('No transformation matrix set')
    }

    return transform(this.internals.transformationMatrix, coordinates)
  }

  transformInverse(coordinates, fromOffset=false) {
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
      [this.options.canvas.width, this.options.canvas.height],
      this.options.viewport,
      {
        translateOrigin: this.options.translateOrigin,
        viewportScale: this.options.viewportScale,
        devicePixelScaling: this.options.devicePixelScaling,
        canvasClientRect: this.options.canvas.getBoundingClientRect(),
        fromOffset,
      },
    )

    return transform(inverseTransformationMatrix, coordinates)
  }

  transformCanvasEvent({ offsetX, offsetY }) {
    // Translate local event coordinates to canvas coordinate system
    return this.transformInverse([ offsetX, offsetY ], true)
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
          left: { type: 'number' },
          top: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          angle: { type: 'number' },
          src: {},
          fontSize: { type: 'number' },
          strokeWidth: { type: 'number' },
        },
      },
    },
  },
}

export class Frame extends BaseFrame {
  constructor(options={}) {
    super(addCanvasDefaults({
      context: '<canvas></canvas>',
      ...options,
    }))

    // Push canvas to nested components
    if (!this.options.handMeDowns.includes('canvas')) {
      this.options.handMeDowns.push('canvas', 'devicePixelScaling')
    }
  }

  async onPrepare() {
    // Check that all nested components
    // are either flow components or
    // that they use the canvas
    const isFlowOrCanvasBased = (acc, c) =>
      acc && (
        c === this ||
        c instanceof Screen ||
        c instanceof BaseSequence ||
        c instanceof Loop ||
        c instanceof Parallel
      )

    const canvasBasedSubtree = reduce(this, isFlowOrCanvasBased, true)
    if (!canvasBasedSubtree) {
      throw new Error(
        'CanvasFrame may only contain flow or canvas-based components',
      )
    }

    // TODO: This is largely lifted (with some adaptations)
    // from the html.Frame implementation. It would be great
    // to reduce duplication slightly. (the differences
    // are the allocation of the el option, and the
    // extraction of the canvas from the parsed context)

    // Parse context HTML
    const parser = new DOMParser()
    this.internals.parsedContext = parser.parseFromString(
      this.options.context, 'text/html',
    )

    // Extract canvas
    this.options.canvas = this.internals
      .parsedContext.querySelector('canvas')

    if (!this.options.canvas) {
      throw new Error('No canvas found in context')
    }

    // Set nested component el to the parent
    // element of the canvas, or the current el
    // (if the canvas is at the uppermost level
    // in the context HTML structure, and
    // therefore its parent in the virtual DOM
    // is a <body> element)
    this.options.content.options.el =
      this.options.canvas.parentElement === null ||
      this.options.canvas.parentElement.tagName === 'BODY'
        ? this.options.el
        : this.options.canvas.parentElement

    // Couple the run cycle of the frame to its content
    this.internals.contentEndHandler = () => this.end()
    this.options.content.on(
      'after:end',
      this.internals.contentEndHandler,
    )

    prepareCanvas.apply(this)
    this.options.insertCanvasOnRun = true

    // Prepare content
    await prepareNested([this.options.content], this)
  }

  // TODO: Again, this method involves a fair amount
  // of duplicated code from html.Frame that might be
  // worth refactoring. For example, this might call
  // super.onRun and pass insertCanvas as a fallback.
  async onRun(frameTimestamp, frameSynced) {
    // Clear element content, and insert context
    this.options.el.innerHTML = ''
    Array.from(this.internals.parsedContext.body.children)
      .forEach(c => this.options.el.appendChild(c))

    // Insert canvas
    // (this is the only change compared to html.Frame)
    insertCanvas.apply(this, [false, this.options.canvas.parentElement])

    // Run nested content (synced to animation frame)
    await this.options.content.run(frameTimestamp, frameSynced)
    // TODO: It might be useful to make the framesync
    // optional for slow components (see html.Frame).
  }

  onEpilogue() {
    // Dereference canvas and context
    delete this.options.canvas
    delete this.internals.parsedContext
  }
}

Frame.metadata = {
  module: ['canvas'],
  nestedComponents: ['content'],
}
