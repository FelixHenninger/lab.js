import React from 'react'
import Tree from '../Tree'

import Node from '../Tree/components/Node'

const Sidebar = (props, context) =>
  <div>
    <Tree
      Node={ Node }
      rootId="root"
      onNodeClick={
        (id) => context.store.dispatch({
          type: 'SHOW_COMPONENT_DETAIL',
          id: id,
        })
      }
      onNodeAdded={ (parent, index) => console.log('Node added below', parent, 'at position', index)}
    />
  </div>

Sidebar.contextTypes = {
  store: React.PropTypes.object
}

export default Sidebar
