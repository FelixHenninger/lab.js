import React from 'react'
import { DropTarget } from 'react-dnd'

import classnames from 'classnames'

import Item from './Item'

const groupTarget = {
  drop: (targetProps, monitor) => {
    const { column } = monitor.getItem()
    targetProps.move(
      column, // id
      targetProps.groupId // target
    )
  },
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

const Group = ({ columns=[], title, connectDropTarget, isOver, children }) =>
  connectDropTarget(
    <tr
      className={ classnames({
        'bg-light': isOver,
      }) }
    >
      <td style={{ padding: '0.75rem 1.25rem', width: '8rem' }}>
        <small className="text-muted">{ title }</small>
      </td>
      <td className="text-center" style={{ padding: '0.75rem 1.25rem' }}>
        {
          children || columns.map((c, i) =>
            <Item
              key={ i }
              column={ c.id }
              name={ c.name }
            />
          )
        }
      </td>
      <td style={{ padding: '0.75rem 1.25rem', width: '8rem' }}>
      </td>
    </tr>
  )

export default DropTarget('item', groupTarget, collect)(Group)
