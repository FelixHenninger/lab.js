import React from 'react'
import Tree from '../Tree'

import Node from '../Tree/components/Node'

const Sidebar = () =>
  <div>
    <Tree
      Node={ Node }
      rootId="root"
      onNodeClick={ (id) => console.log('Node clicked', id) }
      onNodeAdded={ (parent, index) => console.log('Node added below', parent, 'at position', index)}
    />
  </div>

export default Sidebar
