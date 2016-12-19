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
      onNodeAdded={
        (parent, index) => context.store.dispatch({
          type: 'SHOW_MODAL',
          modalType: 'ADD_COMPONENT',
          modalProps: {
            parent: parent,
            index: index,
          },
        })
      }
    />
  </div>

Sidebar.contextTypes = {
  store: React.PropTypes.object
}

export default Sidebar
