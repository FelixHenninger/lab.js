import React from 'react'
import { DropTarget } from 'react-dnd'
import classnames from 'classnames'

// TODO: There must be a better way of passing through the store?
//   Possibly the necessary data can be accessed through props,
//   but this needs to be investigated further
import store from '../../../../store'
import { nestedChildren } from '../../../../logic/tree'

import './index.css'

const TreeDropTarget = (props) =>
  props.connectDropTarget(
    <div
      className={ classnames({
        'dropTarget': true,
        'dropTarget-available': props.canDrop,
        'dropTarget-hover': props.validTarget & props.canDrop,
        'dropTarget-children': props.children,
      }) }
    >
      { props.children || <div className="dropTargetButton" /> }
    </div>
  )

// Wrap everything up  to conform to react-dnd ---------------------------------
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
