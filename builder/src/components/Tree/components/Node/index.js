import React from 'react'
import { Nav, NavItem, NavLink, Button } from 'reactstrap'

import AddButton from '../AddButton'
import DropTarget from '../DropTarget'

import { metadata } from '../../../../logic/components'
import './index.css'

const NodeBody = ({ id, parent, index, active, onClick, onDelete, children }) =>
  <NavLink
    href="#" active={ active }
    style={{ cursor: 'move' }}
    onClick={ () => onClick(id) }
  >
    { children }
    <Button
      onClick={ () => onDelete(id, parent, index) }
      className="delete pull-right"
      size="sm" color="link"
    >
      <i className="fa fa-trash"></i>
    </Button>
  </NavLink>

const NodeTail = ({ id, children, pinned, vacancies, onNodeClick, onNodeDelete, onChildAdded }) =>
  <Nav pills className="flex-column">
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
              onClick={ () => onChildAdded(id, 0) }
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
            onClick={ onNodeClick }
            onDelete={ onNodeDelete }
            onChildAdded={ onChildAdded }
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
                  onClick={ () => onChildAdded(id, childIndex + 1) }
                />
              </div>
          }
        </NavItem>
      )
    }
  </Nav>

const Node = ({ id, parentId, index, data, active, renderBody, onClick, onDelete, onChildAdded, connectDragSource }) => {
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
    <div className="tree-node">
      {
        renderBody !== false ?
          connectDragSource(<div>
            <NodeBody
              id={ id }
              parent={ parentId }
              index={ index }
              active={ active }
              onClick={ onClick }
              onDelete={ onDelete }
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
        onNodeClick={ onClick }
        onNodeDelete={ onDelete }
        onChildAdded={ onChildAdded }
      />
    </div>
  )
}

// Redux integration

import { connect } from 'react-redux'

const ConnectedNode = connect(
  (state, props) => ({
    data: state.components[props.id],
    active: props.id === state.componentDetail.viewProps.id,
  })
)(Node)

// Dnd integration

import { DragSource } from 'react-dnd'

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
