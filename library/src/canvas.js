// Canvas-based displays for lab.js
import { Component } from './core'
import { Sequence as BaseSequence } from './flow'

// Global canvas functions used in all of the following components
// (multiple inheritance would come in handy here, but alas...)

// TODO: Rethink handling of the this binding
// in the following code, and refactor if necessary.
// (code is clean, but not necessarily as elegant
// as possible)

const initCanvas = function(options) {
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
  this.options = {
    canvas: null,
    ctxType: '2d',
    ctx: null,
    insertCanvasOnRun: false,
    ...this.options,
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
    super(options)

    this.options = {
      renderFunction: (() => null),
      ...this.options,
      ...options,
    }

    // Initialize canvas
    initCanvas.apply(this, [options])

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
    super(options)

    // Initialize canvas
    initCanvas.apply(this, [options])

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
