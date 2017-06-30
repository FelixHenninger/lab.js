import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DragSource } from 'react-dnd'
import { Nav, NavItem, NavLink } from 'reactstrap'

import AddButton from '../AddButton'
import DropTarget from '../DropTarget'

import { metadata } from '../../../../logic/components'
import NodeDropDown from './dropdown'

import classnames from 'classnames'
import './index.css'

const NodeBody = (
  { id, parent, index, active, skipped, isDragging, children },
  { onNodeClick, onNodeDelete }
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
      onClick={ () => onNodeClick(id) }
    >
      { children }
      { skipped
        ? <i className="fa fa-minus-circle" aria-hidden="true"></i>
        : null }
    </div>
    <div className='nav-link-tools'>
      <NodeDropDown
        id={ id }
        parent={ parent }
        index={ index }
        onDelete={ onNodeDelete }
      />
    </div>
  </NavLink>

NodeBody.contextTypes = {
  onNodeClick: PropTypes.func,
  onNodeDelete: PropTypes.func,
}

const NodeTail = ({ id, children, pinned, vacancies }, { onNodeAdd }) =>
  <Nav pills className='flex-column'>
    {
      !vacancies ? null :
        <div>
          <li>
            <DropTarget
              id={ id } index={ 0 }
            />
          </li>
          <li>
            <AddButton
              id={ id } index={ 0 }
              onClick={ () => onNodeAdd(id, 0) }
              pinned={ pinned }
            />
          </li>
        </div>
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
              <div>
                <DropTarget
                  id={ id } index={ childIndex + 1 }
                />
                <AddButton
                  id={ id } index={ childIndex + 1 }
                  onClick={ () => onNodeAdd(id, childIndex + 1) }
                />
              </div>
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
  const { type } = data
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
        renderBody !== false ?
          connectDragSource(<div>
            <NodeBody
              id={ id }
              parent={ parentId }
              index={ index }
              active={ active }
              skipped={ data.skip }
              isDragging={ isDragging }
            >
              { data.title }
            </NodeBody>
          </div>) :
          null
      }
      <NodeTail
        id={ id }
        children={ children || [] }
        pinned={ tailPinned }
        vacancies={ tailVacancies }
      />
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
