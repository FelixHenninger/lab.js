import React from 'react'
import { DropTarget } from 'react-dnd'

// TODO: Move this into a CSS file
const dropTargetStyles = {
  base: {
    height: '0',
    marginLeft: '8px',
    border: 'none',
    borderRadius: '0.25rem',
    transition: 'height 0.15s',
  },
  inert: {
  },
  available: {
    height: '0.5rem',
  },
  hover: {
    height: '2rem',
    border: '2px dashed rgba(0, 0, 0, 0.1)',
  }
}

const TreeDropTarget = (props) =>
  props.connectDropTarget(
    <div
      style={
        Object.assign({},
          dropTargetStyles.base,
          props.validTarget
          ? dropTargetStyles.hover
          : (props.canDrop
            ? dropTargetStyles.available
            : dropTargetStyles.inert)
        )
      }
    />
  )

// Wrap everything up  to conform to react-dnd ---------------------------------

// TODO: There must be a better way of passing through the store?
//   Possibly the necessary data can be accessed through props,
//   but this needs to be investigated further
import store from '../../../../store'
import { nestedChildren } from '../../util'

const targetSpec = {
  drop: (targetProps, monitor, component) => {
    // Information from DropSource
    const { id, parentId: oldParent, index: oldIndex } = monitor.getItem()

    // Information from DropTarget
    const { id: newParent, index: newIndex } = targetProps

    store.dispatch({
      type: 'MOVE_COMPONENT',
      id,
      oldParent, oldIndex,
      newParent, newIndex,
    })
  },
  canDrop: (targetProps, monitor) => {
    // Retrieve dragged node
    const itemProps = monitor.getItem()
    const nestedIds = nestedChildren(itemProps.id, store.getState().components)

    return !(
      // The item must not be dropped below the same
      // parent, at the target preceding or following
      // its original position.
      (itemProps.parentId === targetProps.id
        && (itemProps.index === targetProps.index
          || itemProps.index === targetProps.index - 1))
      // Nor may the item be dropped within itself
      || [itemProps.id, ...nestedIds].includes(targetProps.id)
    )
  }
}

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
  validTarget: monitor.canDrop() && monitor.isOver({ shallow: true }),
})

// Make the component a DropTarget
export default DropTarget(
  'node',
  targetSpec,
  collect
)(TreeDropTarget)
