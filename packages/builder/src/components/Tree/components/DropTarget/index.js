import React from 'react'
import { connect } from 'react-redux'
import { createSelectorCreator, defaultMemoize } from 'reselect'

import { DropTarget } from 'react-dnd'
import classnames from 'classnames'
import { isEqual, flow } from 'lodash'

import { parents } from '../../../../logic/tree'

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

// Wrap everything up to conform to react-dnd ----------------------------------
const targetSpec = {
  drop: (targetProps, monitor, component) => {
    // Information from DropSource
    const { id, parentId: oldParent, index: oldIndex } = monitor.getItem()

    // Information from DropTarget
    const { id: newParent, index: newIndex } = targetProps

    targetProps.dispatch({
      type: 'MOVE_COMPONENT',
      id,
      oldParent, oldIndex,
      newParent, newIndex,
    })
  },
  canDrop: (targetProps, monitor) => {
    // Retrieve dragged node
    const itemProps = monitor.getItem()

    return !(
      // The item must not be dropped below the same
      // parent, at the target preceding or following
      // its original position.
      (itemProps.parentId === targetProps.id
        && (itemProps.index === targetProps.index
          || itemProps.index === targetProps.index - 1))
      // Nor may the item be dropped within itself
      || [targetProps.id, ...targetProps.parentIds].includes(itemProps.id)
    )
  }
}

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
  validTarget: monitor.canDrop() && monitor.isOver({ shallow: true }),
})

// Redux integration -----------------------------------------------------------

const getParents = (state, props) =>
  parents(props.id, state.components)

const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
)

const makeMapStateToProps = () => {
  const parentSelector = createDeepEqualSelector(
    [getParents], parents => parents,
  )
  const mapStateToProps = (state, props) => ({
    parentIds: parentSelector(state, props)
  })
  return mapStateToProps
}

// Make the component a DropTarget
export default flow(
  DropTarget('node', targetSpec, collect),
  connect(makeMapStateToProps),
)(TreeDropTarget)
