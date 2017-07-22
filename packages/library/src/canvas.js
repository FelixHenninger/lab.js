// Canvas-based displays for lab.js
import { Component } from './core'
import { Sequence as BaseSequence, Loop, Parallel,
  prepareNested } from './flow'
import { Frame as BaseFrame } from './html'
import { reduce } from './util/tree'

// Global canvas functions used in all of the following components
// (multiple inheritance would come in handy here, but alas...)

// TODO: Rethink handling of the this binding
// in the following code, and refactor if necessary.
// (code is clean, but not necessarily as elegant
// as possible)

const addCanvasDefaults = function(options) {
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
    ...options,
  }
}

const prepareCanvas = function() {
  // Initialize a canvas,
  // if this has not already been done
  if (this.options.canvas == null) {
    this.options.canvas = document.createElement('canvas')
    // Remember to add the canvas to the DOM later
    this.options.insertCanvasOnRun = true
  }
}

const insertCanvas = function() {
  // Add the canvas to the DOM if need be
  if (this.options.insertCanvasOnRun) {
    // Remove all other content within the HTML tag
    // (note that this could be sped up, as per
    // http://jsperf.com/innerhtml-vs-removechild
    // it seems sufficient for the moment, though)
    this.options.el.innerHTML = ''

    // Adjust the canvas dimensions
    // to match those of the containing element
    this.options.canvas.width = this.options.el.clientWidth
    this.options.canvas.height = this.options.el.clientHeight

    // Append the canvas to the DOM
    this.options.el.appendChild(this.options.canvas)
  }
}

export class Screen extends Component {
  constructor(options={}) {
    super({
      renderFunction: (() => null),
      ...addCanvasDefaults(options),
    })

    // Provide an attribute for tracking
    // redraw requests
    this.internals.frameRequest = null
  }

  render(timestamp) {
    return this.options.renderFunction.call(
      this, // context
      timestamp, // arguments ...
      this.options.canvas,
      this.options.ctx,
      this,
    )
  }

  onPrepare() {
    prepareCanvas.apply(this)
  }

  onBeforeRun() {
    // Add canvas to the dom, if necessary
    insertCanvas.apply(this)

    // Extract the requested context for the canvas
    this.options.ctx = this.options.canvas.getContext(
      this.options.ctxType,
    )
  }

  onRun() {
    // Draw on canvas before the next repaint
    this.internals.frameRequest = window.requestAnimationFrame(
      // Context apparently is lost in the callback
      () => this.render(),
    )
  }

  onEnd() {
    // Attempt to cancel any pending frame requests
    window.cancelAnimationFrame(
      this.internals.frameRequest,
    )
  }
}

Screen.metadata = {
  module: ['canvas'],
  nestedComponents: [],
}

// Canvas-based sequence of components
// drawing on the same canvas
export class Sequence extends BaseSequence {
  constructor(options={}) {
    super(
      addCanvasDefaults(options),
    )

    // Push canvas to nested components
    if (!this.options.handMeDowns.includes('canvas')) {
      this.options.handMeDowns.push('canvas')
    }
  }

  onPrepare() {
    // Prepare canvas
    prepareCanvas.apply(this)

    // Check that all nested components
    // use the Canvas
    const isCanvasBased = e =>
      e instanceof Screen ||
      e instanceof Sequence

    if (!this.options.content.every(isCanvasBased)) {
      throw new Error(
        'Content component not a canvas.Screen or canvas.Sequence',
      )
    }

    // Prepare sequence as usual
    return super.onPrepare()
  }

  onRun() {
    // Insert canvas into DOM,
    // if not present already
    insertCanvas.apply(this)

    // Run sequence as usual
    return super.onRun()
  }
}

Sequence.metadata = {
  module: ['canvas'],
  nestedComponents: ['content'],
}

export class Frame extends BaseFrame {
  constructor(options={}) {
    super(addCanvasDefaults({
      context: '<canvas></canvas>',
      ...options,
    }))

    // Push canvas to nested components
    if (!this.options.handMeDowns.includes('canvas')) {
      this.options.handMeDowns.push('canvas')
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
        c instanceof Sequence ||
        c instanceof BaseSequence ||
        c instanceof Loop ||
        c instanceof Parallel
      )

    const canvasBasedSubtree = reduce(this, isFlowOrCanvasBased, true)
    if (!canvasBasedSubtree) {
      throw 'CanvasFrame may only contain flow or canvas-based components'
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
      throw 'No canvas found in context'
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

    // Prepare content
    await prepareNested([this.options.content], this)
  }
}

Frame.metadata = {
  module: ['canvas'],
  nestedComponents: ['content'],
}
