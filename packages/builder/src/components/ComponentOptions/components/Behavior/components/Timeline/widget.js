import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'

import { clamp, sortBy } from 'lodash'
import { Stage } from 'react-konva'

import BackgroundLayer from './backgroundLayer'
import ItemLayer from './itemLayer'
import ItemForm from './itemForm'
import { connect } from 'react-redux'

class TimelineStage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      width: 0, offset: 0,
      activeItem: undefined,
      zoom: props.zoom,
    }

    // Bindings
    this.calcPosition = this.calcPosition.bind(this)
    this.toX = this.toX.bind(this)
    this.closestLayerY = this.closestLayerY.bind(this)
    this.setActive = this.setActive.bind(this)
    this.setCursor = this.setCursor.bind(this)
    this.setZoom = this.setZoom.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.updateItem = this.updateItem.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.handleDuplicateCurrent = this.handleDuplicateCurrent.bind(this)
    this.handleDeleteCurrent = this.handleDeleteCurrent.bind(this)

    // Refs
    this.stage = createRef()
    this.wrapper = createRef()
  }

  componentDidMount() {
    // Calculate available space
    this.setState({
      width: this.wrapper.current.clientWidth,
    })
  }

  getChildContext() {
    return {
      range: this.props.range,
      zoom: this.state.zoom,
      toX: this.toX,
      width: this.state.width,
      height: this.props.height,
      padding: this.props.padding,
      calcPosition: this.calcPosition,
      closestLayerY: this.closestLayerY,
      setCursor: this.setCursor,
      setZoom: this.setZoom,
    }
  }

  // Position math -------------------------------------------------------------

  toX(t, zoom=this.state.zoom) {
    return t / 10**zoom
  }

  toTime(x, zoom=this.state.zoom) {
    return x * 10**zoom
  }

  calcPosition(start, stop, layer) {
    return {
      x: this.toX(parseInt(start) || 0),
      y: this.layerY(layer),
      w: this.toX((parseInt(stop) - parseInt(start)) || 100),
      lockStart: typeof start === 'string' && start.includes('$'),
      lockStop: typeof stop === 'string' && stop.includes('$'),
    }
  }

  closestLayer(y) {
    const clampedY = clamp(y,
      this.props.padding,
      this.props.height - 3 * this.props.padding
    )

    return Math.round(
      (clampedY - this.props.padding) /
      (this.props.layerHeight + this.props.layerGutter)
    )
  }

  closestLayerY(y) {
    return this.layerY(this.closestLayer(y))
  }

  layerY(layer) {
    return layer * (this.props.layerHeight + this.props.layerGutter) +
      this.props.padding
  }

  suggestPosition(item, defaultLength=100) {
    const sortedItems = sortBy(
      this.props.data,
      [i => i.start, i => i.priority]
    )
    const nLayers = this.closestLayer(this.props.height) + 1

    const lastEntry = sortedItems.length > 0
      ? sortedItems[sortedItems.length - 1]
      : { stop: 0, priority: -1 }

    return {
      ...item,
      start: item.start || lastEntry.stop,
      stop: item.stop || lastEntry.stop + defaultLength,
      priority: item.priority || (lastEntry.priority + 1) % nLayers,
    }
  }

  // UI interaction ------------------------------------------------------------

  setActive(item) {
    if (item !== this.state.activeItem) {
      this.setState({ activeItem: item })
    }
  }

  setCursor(cursor) {
    this.stage.current.container().style.cursor = cursor
  }

  setZoom(level) {
    // We try to keep the center centered, changing only the scale
    const currentCenter = this.toTime(
      -1 * (this.stage.current.x() - this.state.width / 2)
      // The horizontal offset is always negative because the underlying
      // coordinate system is shifted into the opposite direction
    )
    // So the new horizontal offset retains the former center position,
    // accounting for the future timeline width, at the new zoom level
    const newOffset = currentCenter - this.toTime(this.state.width / 2, level)

    // Make sure that the timeline bounds are applied
    const clampedOffset = clamp(
      this.toX(newOffset, level),
      this.toX(0, level), // Padding is already applied through stage offset
      this.toX(this.props.range.max, level) - this.state.width
    )

    this.setState({
      zoom: level,
      offset: -clampedOffset, // Reverse sign once more
    })
  }

  // Store/form interaction ----------------------------------------------------

  handleChange(name, value) {
    // TODO: Figure out whether to propagate changes via formik
    // or via Redux, or if the combination is necessary here
    // (vs. a relict from RRF times)
    this.props.formikContext.setFieldValue(
      `timeline[${ this.state.activeItem }].${ name }`,
      value,
    )
  }

  updateItem(item, { x, y, width }) {
    this.props.updateTimelineItem(
      this.context.id, item, {
        start: this.toTime(x),
        stop: this.toTime(x + width),
        priority: this.closestLayer(y)
      }
    )
  }

  handleAdd(item) {
    this.props.formikContext.setFieldValue(
      'timeline', [...this.props.data, this.suggestPosition(item)]
    )
    setImmediate(
      () => this.setState({
        activeItem: this.props.data.length - 1
      })
    )
  }

  handleDuplicateCurrent() {
    if (this.state.activeItem !== undefined) {
      const original = this.props.data[this.state.activeItem]
      this.handleAdd({
        ...original,
        // Remove location information
        start: undefined, stop: undefined, priority: undefined,
        // Duplicate payload
        payload: { ...original.payload },
        // TODO: Preserve duration during duplication
      })
    }
  }

  handleDeleteCurrent() {
    if (this.state.activeItem !== undefined) {
      this.setState({ activeItem: undefined })
      this.props.formikContext.setFieldValue(
        'timeline',
        this.props.data.filter((item, i) => i !== this.state.activeItem)
      )
    }
  }

  render() {
    const { width, offset } = this.state
    const { data, range, height, padding } = this.props

    return (
      <div ref={ this.wrapper }>
        <Stage
          ref={ this.stage }
          width={ width } height={ height }
          x={ offset } // Stage scroll/viewBox offset (changes w/ scrolling)
          offsetX={ -padding } // Horizontal axis offset (constant)
          draggable={ true }
          onDragEnd={ () => null } // Avoid warning for missing drag handler
          dragBoundFunc={ ({ x }) => ({
            x: clamp(x,
              // Sign reversed because the right-hand side
              // is dragged leftward, and vice versa.
              -(this.toX(range.max) - width + padding),
              -(this.toX(range.min, 0) + padding)
              // (the left bound is somewhat hackish -- this scales the
              // left-side padding to 100ms at zoom level zero, though
              // this breaks down at higher levels)
            ),
            y: 0
          }) }
          className="border-bottom"
        >
          <BackgroundLayer
            listening={ false }
          />
          <ItemLayer
            timeline={ data || [] }
            activeItem={ this.state.activeItem }
            updateItem={ this.updateItem }
            setActive={ this.setActive }
          />
        </Stage>
        <ItemForm
          timeline={ data || [] }
          handleChange={ this.handleChange }
          updateItem={ this.updateItem }
          activeItem={ this.state.activeItem }
          setActive={ this.setActive }
          add={ this.handleAdd }
          duplicateCurrent={ this.handleDuplicateCurrent }
          deleteCurrent={ this.handleDeleteCurrent }
        />
      </div>
    )
  }
}

TimelineStage.defaultProps = {
  height: 200,
  padding: 20,
  layerHeight: 30,
  layerGutter: 20,
  range: { min: -100, max: 30000 },
  zoom: 0,
}

TimelineStage.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

TimelineStage.childContextTypes = {
  range: PropTypes.object,
  zoom: PropTypes.number,
  toX: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  padding: PropTypes.number,
  calcPosition: PropTypes.func,
  closestLayerY: PropTypes.func,
  setCursor: PropTypes.func,
  setZoom: PropTypes.func,
}

const mapDispatchToProps = {
  updateTimelineItem: (id, item, { start, stop, priority }) => ({
    type: 'UPDATE_TIMELINE_ITEM',
    id, item,
    data: { start, stop, priority },
  })
}

export default connect(null, mapDispatchToProps)(TimelineStage)
