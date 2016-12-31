import React from 'react'

const Tree = ({ Node, rootId, onNodeClick, onNodeDelete, onNodeAdded }) =>
  <Node
    id={ rootId }
    renderBody={ false }
    parentId={ null }
    onClick={ onNodeClick }
    onDelete={ onNodeDelete }
    onChildAdded={ onNodeAdded }
  />

// TODO: See if the handlers can be moved into
// context, to reduce the amount of passed-down
// parameters

export default Tree
