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

    this.width = el.parentElement.clientWidth
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
    })

    // Customize UI
    fabric.Object.prototype.set({
      cornerSize: 9,
      cornerStyle: 'circle',
      lockSkewingX: true,
      lockSkewingY: true,
      rotatingPointOffset: 30,
      padding: handlePadding,
      strokeLineJoin: 'round',
      transparentCorners: false,
      translateX: 500,
    })

    // Handle changes (dropping for now)
    this.canvas.on('mouse:up', () => null)

    // Grid --------------------------------------------------------------------

    this.canvas.setBackgroundColor(new fabric.Pattern({
      source: makeBackground(gridSize, this.offsetX, this.offsetY).getElement(),
    }))

    // ViewPort overlay --------------------------------------------------------

    this.canvas.setOverlayImage(
      makeOverlay(this.width, this.height, viewPort).toDataURL(),
      () => this.canvas.requestRenderAll(),
      // This is somewhat weird -- the transformation
      // should really also apply to the overlay,
      { left: -this.width/2 - 10, top: -this.height/2 - 10 }
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

    // Hand changes on ---------------------------------------------------------
    this.canvas.on('object:selected', this.props.updateHandler)
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
    this.canvas.on('selection:cleared', this.props.clearSelectionHandler)

    // Load data from props, if provided ---------------------------------------

    if (this.props.data) {
      this.canvas.loadFromJSON(
        { objects: this.props.data },
        () => this.canvas.requestRenderAll(),
      )
    }

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
      }

      switch(type) {
        case 'line':
          return new fabric.Line([-50, 0, 50, 0] ,{
            stroke: 'black',
          })
        case 'circle':
          return new fabric.Circle({
            radius: 27.5,
            lockRotation: true,
            lockUniScaling: true,
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
            hasControls: false,
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
        c => this.canvas.add(c)
      )
    )
  }

  toObject() {
    return this.canvas.toObject()
  }

  render () {
    return <canvas />
  }
}
