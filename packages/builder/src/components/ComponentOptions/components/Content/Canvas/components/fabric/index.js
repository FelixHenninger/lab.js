import React, { Component, createRef } from 'react'
import { ReactReduxContext } from 'react-redux'

import { fabric } from 'fabric'

import makeBackground from './background'
import makeOverlay from './overlay'

import { filePlaceholderRegex } from '../../logic'
import { getLocalFile } from '../../../../../../../logic/util/files'

// Customize image behavior ----------------------------------------------------

fabric.Image.prototype.toObject = (function(toObject) {
  return function(propertiesToInclude) {
    const { width, height } = this.getOriginalSize()
    return {
      ...toObject.apply(this, [propertiesToInclude]),
      // Save the image's original resolution,
      // but fall back onto raw width and height
      // if these are not available.
      // (i.e. if the image couldn't be loaded)
      naturalWidth: width || this.width,
      naturalHeight: height || this.height,
      // Restore original (placeholder-based) path
      // for export (this is useful mostly when new
      // images are added, after that, updates to
      // placeholder-based attributes are blocked by
      // editor logic)
      src: this._src ? this._src : this.src,
    }
  }
})(fabric.Image.prototype.toObject)

fabric.Image.prototype._renderFill = (function(renderFill) {
  return function(ctx) {
    if (!this.src && !this._pattern) {
      ctx.save()
      ctx.beginPath()
      const w = this.width || 50
      const h = this.height || 50
      ctx.fillStyle = 'rgba(50, 50, 50, 0.25)'
      ctx.fillRect(
        -w / 2, -h / 2,
        w, h,
      )
      ctx.restore()
    } else {
      // Use standard rendering path
      renderFill.apply(this, [ctx])
    }
  }
})(fabric.Image.prototype._renderFill)

fabric.Image.fromObject = function(_object, callback) {
  var object = fabric.util.object.clone(_object)
  fabric.util.loadImage(object.src, function(img, error) {
    // Substitute empty image in case of error
    const image = new fabric.Image(
      error ? new Image() : img,
      object
    )
    image.crossOrigin = "anonymous"

    // Pretend that we were successful in any case
    callback(image)
  })
}

// Add AOI object type ---------------------------------------------------------

// (apparently fabric requires camelcased constructors)
fabric.Aoi = fabric.util.createClass(fabric.Rect, {
  type: 'aoi',
  label: '',
  initialize: function(options={}) {
    options.fill = 'rgba(0, 0, 0, 0.2)'
    this.callSuper('initialize', options)
  },
})

fabric.Aoi.fromObject = function(object, callback, forceAsync) {
  return fabric.Object._fromObject('Aoi', object, callback, forceAsync);
}

// Customize text behavior -----------------------------------------------------
// Always paste and apply style
fabric.disableStyleCopyPaste = true

// Canvas component ------------------------------------------------------------

const handlePadding = 6

export default class FabricCanvas extends Component {
  static contextType = ReactReduxContext

  constructor(...args) {
    super(...args)
    this.state = {
      objects: {},
      activeObject: null,
    }

    this.updateActive = this.updateActive.bind(this)
    this.canvasRef = createRef()
  }

  componentDidMount() {
    // Options
    const gridSize = 25
    const snapThreshold = 10
    const viewPort = [800, 600]

    // Initialize canvas element
    const el = this.canvasRef.current.parentElement

    this.width = el.clientWidth - 15
    this.height = Math.max(
      Math.ceil(el.clientWidth * 9/16),
      viewPort[1] + 2 * gridSize,
    )

    // Calculate offsets so that the grid runs
    // through the center of the canvas
    this.offsetX = parseInt((this.width / 2) % gridSize, 10)
    this.offsetY = parseInt((this.height / 2) % gridSize, 10)

    // Initialize fabric canvas
    this.canvas = new fabric.Canvas()
    this.canvas.initialize(this.canvasRef.current, {
      width: this.width,
      height: this.height,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      viewportTransform: [
        1, 0,
        0, 1,
        this.width/2, this.height/2
      ],
      selection: false, // No multiple selection
    })

    // UI Customization --------------------------------------------------------
    // Overall
    fabric.Object.prototype.set({
      cornerSize: 9,
      cornerStyle: 'circle',
      lockSkewingX: true,
      lockSkewingY: true,
      rotatingPointOffset: 30,
      padding: handlePadding,
      strokeLineJoin: 'round',
      transparentCorners: false,
    })

    // Per-type
    fabric.Circle.prototype.hasRotatingPoint = false
    fabric.Circle.prototype.lockUniScaling = true
    fabric.Image.prototype.lockUniScaling = true
    fabric.Line.prototype.lockScalingY = true
    fabric.Line.prototype.setControlsVisibility({
      ml: true,
      mr: true,
      mt: false,
      mb: false,
      bl: false,
      br: false,
      tl: false,
      tr: false,
    })

    fabric.IText.prototype.hasControls = false

    // Load data from props, if provided ---------------------------------------

    if (this.props.data) {
      this.canvas.loadFromJSON(
        { objects: this.props.data },
        () => {
          this.setupSnapping(gridSize, snapThreshold)
          this.setupHandlers()
          this.setupGrid(gridSize)
          this.setupOverlay(viewPort)
          this.canvas.requestRenderAll()
        },
      )
    } else {
      this.setupSnapping(gridSize, snapThreshold)
      this.setupHandlers()
      this.setupGrid(gridSize)
      this.setupOverlay(viewPort)
    }

    // Listen for preload event
    window.addEventListener('preview:preempt', this.updateActive)
  }

  componentWillUnmount() {
    window.removeEventListener('preview:preempt', this.updateActive)
  }

  setupSnapping(gridSize, threshold) {
    const nearestGrid = (x, stepSize=gridSize) =>
      Math.round(x / stepSize) * stepSize

    const snap = (x) =>
      Math.abs(x - nearestGrid(x)) < threshold

    const snappedCoord = (x) =>
      snap(x) ? nearestGrid(x) : x

    // Snap origin on move
    this.canvas.on('object:moving', ({ target, e: { shiftKey } }) => {
      const { left, top } = target

      // TODO: It would be nice to show the snapping point,
      // as it depends on the origin coordinates

      // TODO: Re-think snapping override key
      // (should match common software, e.g. Inkscape,
      // and be consistent with scaling, which depends
      // on several modifier keys)
      if (!shiftKey && (snap(left) || snap(top))) {
        // Round position to closest grid point
        target.set({
          left: snappedCoord(left),
          top:  snappedCoord(top),
        }).setCoords()
      }
    })

    // Rotation snapping
    // (currently at 15deg increments)
    this.canvas.on('object:rotating', ({ target, e: { shiftKey } }) => {
      if (!shiftKey) {
        target.set({
          angle: nearestGrid(target.angle, 15)
        })
      }
    })
  }

  setupHandlers() {
    // Hand on any changes to appropriate handlers
    this.canvas.on('object:added', this.props.addHandler)
    this.canvas.on('object:removed', this.props.deleteHandler)
    this.canvas.on('object:modified', ({ target }) => {
      // Normalize scaling
      target.set({
        width: target.width && target.type !== 'image'
          ? target.width * target.scaleX
          : target.width,
        height: target.height && target.type !== 'image'
          ? target.height * target.scaleY
          : target.height,
        radius: target.radius ? target.radius * target.scaleX : target.radius,
        rx: target.rx ? target.rx * target.scaleX : target.rx,
        ry: target.ry ? target.ry * target.scaleY : target.ry,
        scaleX: target.type === 'image'
          ? target.scaleX
          : 1,
        scaleY: target.type === 'image'
          ? target.scaleY
          : 1,
      })

      // Hand changes on
      this.props.updateHandler({ target })
    })

    // Pass on further useful events -------------------------------------------
    this.canvas.on('selection:created', this.props.updateSelectionHandler)
    this.canvas.on('selection:updated', this.props.updateSelectionHandler)
    this.canvas.on('selection:cleared', this.props.clearSelectionHandler)
  }

  setupGrid(gridSize) {
    this.canvas.setBackgroundColor(new fabric.Pattern({
      source: makeBackground(gridSize, this.offsetX, this.offsetY).getElement(),
    }))
  }

  setupOverlay(viewPort) {
    this.canvas.setOverlayImage(
      // There used to be the option
      // { multiplier: 1 / window.devicePixelRatio }
      // in the call to toDataURL, but the extra scaling
      // doesn't seem to be necessary any more
      makeOverlay(this.width, this.height, viewPort).toDataURL(),
      () => this.canvas.requestRenderAll(),
      // This is somewhat weird -- the transformation
      // should really also apply to the overlay,
      { originX: 'center', originY: 'center', _pattern: true }
    )
  }

  // TODO: External change handlers
  // need to call change handler directly
  async add(type, options={}) {
    // This construction is dubious
    const newObject = await (async () => {
      const defaults = {
        originX: 'center',
        originY: 'center',
        left: 0,
        top: 0,
        fill: 'black',
        id: this.props.idSource(),
      }

      switch(type) {
        case 'line':
          return new fabric.Line([-50, 0, 50, 0], {
            stroke: 'black',
            id: defaults.id, // Re-use id generated above
            originX: 'center',
            originY: 'center',
          })
        case 'circle':
          return new fabric.Circle({
            radius: 27.5,
            ...defaults,
            ...options,
          }).setControlVisible('mtr', false)
        case 'ellipse':
          return new fabric.Ellipse({
            rx: 30,
            ry: 25,
            ...defaults,
            ...options,
          })
        case 'triangle':
          return new fabric.Triangle({
            width: 2 * 50 * Math.sqrt(1/3),
            height: 50,
            ...defaults,
            ...options,
          })
        case 'rect':
          return new fabric.Rect({
            width: 50, height: 50,
            ...defaults,
            ...options,
          })
        case 'text':
          const content = options.content
          delete options.content
          return new fabric.IText(content, {
            fontFamily: 'sans-serif',
            fontSize: 32,
            textAlign: 'center',
            ...defaults,
            ...options,
          })
        case 'image':
          const placeholderMatch = options.src.match(filePlaceholderRegex)
          if (placeholderMatch) {
            // Save original placeholder-based path
            options._src = options.src
            options.src = getLocalFile(
              this.context.store,
              this.props.id,
              placeholderMatch[1]
            ).file.content
          }
          const img = await new Promise((resolve, reject) => {
            const image = new Image()

            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', e => reject(e))

            image.crossOrigin = "anonymous"
            image.src = options.src
          })

          return new fabric.Image(img, {
            ...defaults,
            ...options,
          })
        case 'aoi':
          return new fabric.Aoi({
            width: 50, height: 50,
            ...defaults,
          })
        default:
          return undefined
      }
    })()

    if (newObject) {
      this.canvas.add(newObject)
      this.canvas.setActiveObject(newObject)
    }
  }

  updateActive() {
    const selection = this.canvas.getActiveObjects()
    selection.forEach((target) => {
      if (target.type === 'i-text') {
        this.props.updateHandler({ target })
      }
    })
  }

  modifyActive(method, ...args) {
    // Find selected object or group thereof
    // FIXME: In 2.0, this appears to covers groups, see
    // https://github.com/kangax/fabric.js/blob/10545cec7773cd1c00312c1428f09ea43fd8ac52/test/unit/canvas.js#L1263
    const selection = this.canvas.getActiveObjects()

    // At present, multiple selection is deactivated, so that this loop
    // will only ever run once (there were some issues with multiple
    // selection / concurrent modification)
    selection.forEach(o => {
      switch(method) {
        case 'remove':
          this.canvas.discardActiveObject()
          this.canvas.remove(o)
          break
        default:
          // Update image src, if required (and then rerender)
          if (o.type === 'image' &&
            args[0] && args[0].src && // new options are provided ...
            o.src !== args[0].src     // ... and the src changed
          ) {
            o.setSrc(args[0].src, () => this.canvas.requestRenderAll())
          }

          // Apply modifications
          o[method].call(o, ...args)

          // Update handle coordinates
          o.setCoords()
      }
    })

    // Re-render canvas
    this.canvas.requestRenderAll()
  }

  cloneActive() {
    this.canvas.getActiveObjects().map(
      o => o.clone(
        c => {
          c.id = this.props.idSource()
          this.canvas.add(c)
          this.canvas.setActiveObject(c)
        }
      )
    )
  }

  toObject() {
    return this.canvas.toObject(['id'])
  }

  render () {
    return <canvas ref={ this.canvasRef } />
  }
}
