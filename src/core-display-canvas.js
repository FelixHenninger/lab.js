// Canvas-based displays for lab.js

// Global canvas functions used in all of the following elements
// (multiple inheritance would come in handy here, but alas...)

// TODO: Rethink handling of the this binding
// in the following code, and refactor if necessary.
// (code is clean, but not necessarily as elegant
// as possible)

const canvas_init = function(options) {
  // Setup canvas handling:
  // By default, the element does not
  // come bundled with a canvas. Instead,
  // the expectation is that it will receive
  // a canvas by the time it is prepared,
  // otherwise the element will take care of
  // creating its own canvas and appending
  // it to the dom at runtime.
  // Either way, a canvas is definitely present
  // after the Element is prepared.
  this.canvas = null
  this.ctx_type = options.ctx_type || '2d'
  this.ctx = null
  this._canvas_needs_appending = false
}

const canvas_prepare = function() {
  // Initialize a canvas,
  // if this has not already been done
  if (this.canvas == null) {
    this.canvas = document.createElement('canvas')
    // Remember to add the canvas to the DOM later
    this._canvas_needs_appending = true
  }
}

const canvas_insert = function() {
  // Add the canvas to the DOM if need be
  if (this._canvas_needs_appending) {
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

export class CanvasScreen extends BaseElement {
  constructor(render_function, options={}) {
    super(options)
    this.render_function = render_function

    // Initialize canvas
    canvas_init.apply(this, [options])

    // Provide an attribute for tracking
    // redraw requests
    this.frame_request = null
  }

  render(timestamp) {
    return this.render_function(
      timestamp,
      this.canvas,
      this.ctx,
      this
    )
  }

  prepare() {
    canvas_prepare.apply(this)

    // Bind render function to local context
    this.render_function = this.render_function.bind(this)

    // Everything else happens as usual
    return super.prepare()
  }

  run() {
    // Add canvas to the dom, if necessary
    canvas_insert.apply(this)

    // Extract the requested context for the canvas
    this.ctx = this.canvas.getContext(
      this.ctx_type
    )

    // Draw on canvas before the next repaint
    this.frame_request = window.requestAnimationFrame(
      // Context apparently is lost in the callback
      this.render.bind(this)
    )

    // Return promise from ancestor
    return super.run()
  }

  end(reason) {
    // Attempt to cancel any pending frame requests
    window.cancelAnimationFrame(
      this.frame_request
    )

    // Otherwise, end as per default
    return super.end(reason)
  }
}
