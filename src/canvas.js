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
  this.canvas = null
  this.ctxType = options.ctxType || '2d'
  this.ctx = null
  this.internals.insertCanvasOnRun = false
}

const prepareCanvas = function() {
  // Initialize a canvas,
  // if this has not already been done
  if (this.canvas == null) {
    this.canvas = document.createElement('canvas')
    // Remember to add the canvas to the DOM later
    this.internals.insertCanvasOnRun = true
  }
}

const insertCanvas = function() {
  // Add the canvas to the DOM if need be
  if (this.internals.insertCanvasOnRun) {
    // Remove all other content within the HTML tag
    // (note that this could be sped up, as per
    // http://jsperf.com/innerhtml-vs-removechild
    // it seems sufficient for the moment, though)
    this.el.innerHTML = ''

    // Adjust the canvas dimensions
    // to match those of the containing element
    this.canvas.width = this.el.clientWidth
    this.canvas.height = this.el.clientHeight

    // Append the canvas to the DOM
    this.el.appendChild(this.canvas)
  }
}

export class Screen extends Component {
  constructor(options={}) {
    super(options)
    this.renderFunction = options.renderFunction || (() => null)

    // Initialize canvas
    initCanvas.apply(this, [options])

    // Provide an attribute for tracking
    // redraw requests
    this.frameRequest = null
  }

  render(timestamp) {
    return this.renderFunction.call(
      this, // context
      timestamp, // arguments ...
      this.canvas,
      this.ctx,
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
    this.ctx = this.canvas.getContext(
      this.ctxType,
    )
  }

  onRun() {
    // Draw on canvas before the next repaint
    this.frameRequest = window.requestAnimationFrame(
      // Context apparently is lost in the callback
      () => this.render(),
    )
  }

  onEnd() {
    // Attempt to cancel any pending frame requests
    window.cancelAnimationFrame(
      this.frameRequest,
    )
  }
}

Screen.module = ['canvas']

// Canvas-based sequence of components
// drawing on the same canvas
export class Sequence extends BaseSequence {
  constructor(options={}) {
    super(options)

    // Initialize canvas
    initCanvas.apply(this, [options])

    // Push canvas to nested components
    if (!this.handMeDowns.includes('canvas')) {
      this.handMeDowns.push('canvas')
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

    if (!this.content.every(isCanvasBased)) {
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

Sequence.module = ['canvas']
