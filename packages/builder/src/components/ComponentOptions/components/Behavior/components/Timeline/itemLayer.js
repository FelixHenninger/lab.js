import React from 'react'
import PropTypes from 'prop-types'

import { Layer, Rect } from 'react-konva'
import { capitalize } from 'lodash'

import Item from './item'

const ItemLayer = (
  { timeline, activeItem, setActive, updateItem },
  { width, height }
) =>
  <Layer>
    {/* TODO: This is a bit of a hack,
        it would be nicer to capture clicks on the underlying stage */}
    <Rect
      x={ 0 } y={ 0 }
      width={ width } height={ height }
      onClick={ () => setActive(undefined) }
    />
    {
      timeline.map((item, i) =>
        <Item
          key={ `timelineitem-${ i }` }
          label={ item.type ? capitalize(item.type) : '?' }
          start={ item.start }
          stop={ item.stop }
          priority={ item.priority }
          active={ activeItem === i }
          onClick={ () => setActive(i) }
          update={ pos => updateItem(i, pos) }
        />
      )
    }
  </Layer>

ItemLayer.contextTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
}

export default ItemLayer
