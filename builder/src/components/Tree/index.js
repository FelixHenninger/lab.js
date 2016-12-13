import React from 'react'

const Tree = ({ Node, rootId, onNodeClick, onNodeAdded }) =>
  <Node
    id={ rootId }
    renderBody={ false }
    parentId={ null }
    onClick={ onNodeClick }
    onChildAdded={ onNodeAdded }
  />

// TODO: See if the handlers can be moved into
// context, to reduce the amount of passed-down
// parameters

export default Tree
