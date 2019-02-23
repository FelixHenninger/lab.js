import React, { createRef } from 'react'
import PropTypes from 'prop-types'
import { Group, Text, Rect, Circle } from 'react-konva'
import { clamp } from 'lodash'

import colors from './colors'

const Item = (
  { label, priority, start, stop, active, onClick, update },
  { calcPosition, closestLayerY, padding, width, setCursor }
) => {
  const height = 36
  const { x, y, w } = calcPosition(start, stop, priority)

  // Refs
  const container = createRef()
  const box = createRef()
  const handleRight = createRef()

  return (
    <Group
      ref={ container }
      x={ x } y={ y }
      draggable
      dragBoundFunc={ ({ x, y }) => ({
        x: clamp(x, padding, width - padding),
        y: closestLayerY(y)
      }) }
      onDragStart={ () => {
        setCursor('grabbing')
        box.current.shadowEnabled(true)
      } }
      onDragEnd={ () => {
        box.current.shadowEnabled(active)
        setCursor('grab')
        const { x, y } = container.current.position()
        const width = box.current.width()
        update({ x, y, width })
      } }
    >
      <Rect
        ref={ box }
        x={ 0.5 } y={ 0.5 }
        height={ height } width={ w }
        cornerRadius={ 4 }
        fill={ active ? colors.active : 'white' }
        stroke={ active ? 'white' : colors.buttonBorder }
        strokeWidth={ 1 }
        onClick={ onClick }
        onMouseEnter={ () => setCursor('grab') }
        onMouseLeave={ () => setCursor('default') }
        shadowColor="rgba(0, 0, 0, 0.125)"
        shadowBlur={ 8 }
        shadowEnabled={ active }
      />
      <Text
        listening={ false }
        x={ 12 } y={ 12 }
        text={ label }
        fontFamily="Fira Sans"
        fontSize={ 14 }
        fill={ active ? 'white' : colors.root }
      />
      {/* TODO: Simplify the pesky rendering offsets */}
      <Circle
        visible={ active } listening={ active }
        x={ 0.5 } y={ height/2 } radius={ 6 }
        fill={ colors.active } stroke={ 'white' } strokeWidth={ 2 }
        draggable
        dragBoundFunc={ ({ x: dragX }) => ({
          x: clamp(dragX, padding + 0.5, x + width - padding),
          y: closestLayerY(y) + height/2
        }) }
        onDragMove={ (e) => {
          const { x: dragX } = e.target.getAbsolutePosition()
          const width = w - (dragX - 0.5 - x)
          container.current.position({ x: dragX - 0.5, y })
          // All other positions are relative to the container
          box.current.width(width)
          handleRight.current.position({ x: width, y: height/2 })
        } }
        onMouseEnter={ () => setCursor('ew-resize') }
        onMouseLeave={ () => setCursor('default') }
      />
      <Circle
        ref={ handleRight }
        visible={ active } listening={ active }
        x={ w + 0.5 } y={ height/2 } radius={ 6 }
        fill={ colors.active } stroke={ 'white' } strokeWidth={ 2 }
        draggable
        dragBoundFunc={ ({ x: dragX }) => ({
          // In absolute coordinates
          x: clamp(dragX, x + padding, width - padding),
          y: closestLayerY(y) + height/2
        }) }
        onDragMove={ (e) => {
          box.current.width(
            // Remove circle offset
            e.target.getAbsolutePosition().x - 0.5 - x
          )
        } }
        onMouseEnter={ () => setCursor('ew-resize') }
        onMouseLeave={ () => setCursor('default') }
      />
    </Group>
  )
}

Item.contextTypes = {
  width: PropTypes.number,
  padding: PropTypes.number,
  calcPosition: PropTypes.func,
  closestLayerY: PropTypes.func,
  setCursor: PropTypes.func,
}

export default Item
