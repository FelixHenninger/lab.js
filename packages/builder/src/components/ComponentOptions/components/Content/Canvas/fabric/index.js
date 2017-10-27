import React, { Component } from 'react'

import { fabric } from 'fabric'
import { findDOMNode } from 'react-dom'

import makeBackground from './background'
import makeOverlay from './overlay'

// Canvas component ------------------------------------------------------------

const handlePadding = 6

export default class FabricCanvas extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      objects: {},
      activeObject: null,
    }
  }

  componentDidMount() {
    // Options
    const gridSize = 25
    const snapThreshold = 10
    const viewPort = [800, 600]

    // Initialize canvas element
    const el = findDOMNode(this)

    this.width = el.parentElement.clientWidth - 15
    this.height = Math.max(
      Math.ceil(el.parentElement.clientWidth * 9/16),
      viewPort[1] + 2 * gridSize,
    )

    // Calculate offsets so that the grid runs
    // through the center of the canvas
    this.offsetX = parseInt((this.width / 2) % gridSize, 10)
    this.offsetY = parseInt((this.height / 2) % gridSize, 10)

    // Initialize fabric canvas
    this.canvas = new fabric.Canvas()
    this.canvas.initialize(el, {
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

    // ViewPort overlay --------------------------------------------------------

    this.canvas.setOverlayImage(
      makeOverlay(this.width, this.height, viewPort).toDataURL({
        // Correct scale for high-DPI devices
        multiplier: 1 / window.devicePixelRatio,
      }),
      () => this.canvas.requestRenderAll(),
      // This is somewhat weird -- the transformation
      // should really also apply to the overlay,
      { originX: 'center', originY: 'center'}
    )

    // Snapping ----------------------------------------------------------------

    const nearestGrid = (x, stepSize=gridSize) =>
      Math.round(x / stepSize) * stepSize

    const snap = (x) =>
      Math.abs(x - nearestGrid(x)) < snapThreshold

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

    // Load data from props, if provided ---------------------------------------

    if (this.props.data) {
      this.canvas.loadFromJSON(
        { objects: this.props.data },
        () => this.canvas.requestRenderAll(),
      )
    }

    // Hand on any further changes ---------------------------------------------
    this.canvas.on('object:added', this.props.addHandler)
    this.canvas.on('object:removed', this.props.deleteHandler)
    this.canvas.on('object:modified', ({ target }) => {
      // Normalize scaling
      target.set({
        width: target.width ? target.width * target.scaleX : target.width,
        height: target.height ? target.height * target.scaleY : target.height,
        radius: target.radius ? target.radius * target.scaleX : target.radius,
        rx: target.rx ? target.rx * target.scaleX : target.rx,
        ry: target.ry ? target.ry * target.scaleY : target.ry,
        scaleX: 1,
        scaleY: 1,
      })

      // Hand changes on
      this.props.updateHandler({ target })
    })

    // Pass on further useful events -------------------------------------------
    // TODO: Change to 'selection:created' as soon as supported in fabric.js
    this.canvas.on('object:selected', this.props.updateSelectionHandler)
    this.canvas.on('selection:cleared', this.props.clearSelectionHandler)

    // Grid --------------------------------------------------------------------
    // (is defined last, otherwise would be overridden by loaded data)

    this.canvas.setBackgroundColor(new fabric.Pattern({
      source: makeBackground(gridSize, this.offsetX, this.offsetY).getElement(),
    }))

    // Mock data ---------------------------------------------------------------
    /*
    this.add('circle', { fill: 'orange' })
    this.add('text', { content: 'hello world!' })
    this.add('rect', { width: 10, height: 10, left: -395, top: -295 })
    this.add('rect', { width: 10, height: 10, left: -395, top: +295 })
    this.add('rect', { width: 10, height: 10, left: +395, top: +295 })
    this.add('rect', { width: 10, height: 10, left: +395, top: -295 })
    this.add('rect', { width: 10, height: 10, left: -405, top: -305 })
    this.add('rect', { width: 10, height: 10, left: -405, top: +305 })
    this.add('rect', { width: 10, height: 10, left: +405, top: +305 })
    this.add('rect', { width: 10, height: 10, left: +405, top: -305 })
    */
  }

  // TODO: External change handlers
  // need to call change handler directly
  add(type, options={}) {
    // This construction is dubious
    const newObject = (() => {
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
            fontSize: 32,
            textAlign: 'center',
            ...defaults,
            ...options,
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

  modifyActive(method, ...args) {
    // Find selected object or group thereof
    // FIXME: In 2.0, this appears to covers groups, see
    // https://github.com/kangax/fabric.js/blob/10545cec7773cd1c00312c1428f09ea43fd8ac52/test/unit/canvas.js#L1263
    const selection = this.canvas.getActiveObjects()

    // For now, ignore value to multiple selections
    // (for the sake of the author's sanity)
    if (method !== 'set' || selection.length === 1) {
      selection.map(o => {
        switch(method) {
          case 'remove':
            this.canvas.discardActiveObject()
            return this.canvas.remove(o)
          default:
            // Call specified method while passing in
            // selection as current scope
            const output = o[method].call(o, ...args)

            // Update handle coordinates
            o.setCoords()

            // Return selection, just in case
            return output
        }
      })

      // Re-render canvas
      this.canvas.requestRenderAll()
    }
  }

  cloneActive() {
    this.canvas.getActiveObjects().map(
      o => o.clone(
        c => {
          c.id = this.props.idSource()
          this.props.addHandler({ target: c })
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
    return <canvas />
  }
}
