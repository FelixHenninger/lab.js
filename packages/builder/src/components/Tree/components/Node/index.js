import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DragSource } from 'react-dnd'
import { Nav, NavItem, NavLink } from 'reactstrap'

import AddButton from '../AddButton'
import DropTarget from '../DropTarget'
import Icon from '../../../Icon'

import { metadata } from '../../../../logic/components'
import NodeDropDown from './dropdown'

import classnames from 'classnames'
import './index.css'

const NodeBody = (
  { id, parent, index, children,
    active, collapsed, skipped, tardy,
    isDragging, hasChildren },
  { onNodeClick, onNodeDelete, onNodeDuplicate }
) =>
  <NavLink
    href='#' active={ active }
    className={ classnames({
      isDragging,
      'text-muted': skipped
    }) }
  >
    <div
      className='nav-link-main'
      onClick={ e => onNodeClick(e, id) }
    >
      { children }
      { collapsed ? <Icon icon="plus" /> : null }
      { skipped ? <Icon icon="minus-circle" /> : null }
      { tardy ? <Icon icon="alarm-clock" /> : null }
    </div>
    <div className='nav-link-tools'>
      <NodeDropDown
        id={ id }
        parent={ parent }
        index={ index }
        collapsed={ collapsed }
        hasChildren={ hasChildren }
        onDelete={ onNodeDelete }
        onDuplicate={ onNodeDuplicate }
      />
    </div>
  </NavLink>

NodeBody.contextTypes = {
  onNodeClick: PropTypes.func,
  onNodeDelete: PropTypes.func,
  onNodeDuplicate: PropTypes.func,
}

const NodeGap = ({ id, index, onNodeAdd, pinned }) =>
  <div className="nodeGap">
    {
      pinned
        ? <DropTarget id={ id } index={ index } >
            <AddButton
              id={ id } index={ index }
              onClick={ () => onNodeAdd(id, index) }
              pinned={ pinned }
            />
          </DropTarget>
        : <div>
            <DropTarget
              id={ id } index={ index }
            />
            <AddButton
              id={ id } index={ index }
              onClick={ () => onNodeAdd(id, index) }
            />
          </div>
    }
  </div>

const NodeTail = ({ id, children, pinned, vacancies }, { onNodeAdd }) =>
  <Nav pills className='flex-column'>
    {
      !vacancies ? null :
        <NodeGap
          id={ id }
          index={ 0 }
          pinned={ pinned }
          onNodeAdd={ onNodeAdd }
        />
    }
    {
      children.map((childId, childIndex) =>
        <NavItem key={ `${ id }_${ childIndex }_${ childId }` }>
          <DraggableNode
            id={ childId }
            parentId={ id } index={ childIndex }
          />
          {
            /* Allow users to add more children only if there are vacancies */
            !vacancies ? null :
              <NodeGap
                id={ id }
                index={ childIndex + 1 }
                onNodeAdd={ onNodeAdd }
              />
          }
        </NavItem>
      )
    }
  </Nav>

NodeTail.contextTypes = {
  onNodeAdd: PropTypes.func,
}

const Node = ({ id, parentId, index, data, active, renderBody,
  isDragging, connectDragSource }) => {
  const { type, _collapsed: collapsed, _template: template } = data
  const { minChildren, maxChildren } = metadata[type]

  const children = data.children || []

  // Show the add button permanently if the component
  // expects subordinate components
  const tailPinned = children.length < minChildren &&
    children.length < maxChildren

  // Don't allow adding or dropping additional
  // subordinate components if there is no more room
  const tailVacancies = children.length < maxChildren

  return (
    <div className='tree-node'>
      {
        renderBody !== false
          ? connectDragSource(
              // (React-DnD requires a native element wrapper)
              <div>
                <NodeBody
                  id={ id }
                  parent={ parentId }
                  index={ index }
                  hasChildren={ (children || []).length > 0 }
                  active={ active }
                  collapsed={ collapsed }
                  skipped={ data.skip }
                  tardy={ data.tardy }
                  isDragging={ isDragging }
                >
                  { data.title }
                </NodeBody>
              </div>
            )
          : null
      }
      {
        collapsed || template
          ? null
          : <NodeTail
              id={ id }
              children={ children || [] }
              pinned={ tailPinned }
              vacancies={ tailVacancies }
            />
      }
    </div>
  )
}

// Redux integration
const ConnectedNode = connect(
  (state, props) => ({
    data: state.components[props.id],
    active: props.id === state.componentDetail.viewProps.id,
  })
)(Node)

// Dnd integration
const nodeSource = {
  beginDrag(props) {
    // Extract identifying data from the
    // dragged node, to be provided to the target
    const { id, parentId, index } = props
    return { id, parentId, index }
  }
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const DraggableNode = DragSource(
  'node',
  nodeSource,
  collect
)(ConnectedNode)

export default DraggableNode
