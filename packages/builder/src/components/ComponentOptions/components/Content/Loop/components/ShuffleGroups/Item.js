import React from 'react'
import { DragSource } from 'react-dnd'

const itemSource = {
  beginDrag: ({ column }) => {
    return { column }
  },
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const Item = ({ name, connectDragSource, isDragging }) =>
  connectDragSource(
    <div
      className="d-inline-block m-1 mr-2 p-2 px-4 border rounded-pill"
      style={{
        opacity: isDragging ? 0.4 : 1,
        transform: 'translate(0, 0)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <span style={{ position: 'relative', top: '1px' }}>
        { name }
      </span>
    </div>
  )

export default DragSource('item', itemSource, collect)(Item)
