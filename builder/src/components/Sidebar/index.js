import React from 'react'

import Toolbar from '../Toolbar'
import Tree from '../Tree'
import Node from '../Tree/components/Node'

import logo from '../../../public/logo.blue.png'

const Sidebar = (props, context) =>
  <div>
    <div style={{ textAlign: 'center' }}>
      <img
        src={ logo }
        alt="lab.js logo"
        style={{ width: '115px', marginBottom: '24px' }}
      />
    </div>
    <Toolbar />
    <hr style={{ marginBottom: '14px' }} />
    <Tree
      Node={ Node }
      rootId="root"
      onNodeClick={
        (id) => context.store.dispatch({
          type: 'SHOW_COMPONENT_DETAIL',
          id: id,
        })
      }
      onNodeDelete={
        (id, parent, index) => {
          if (confirm('Do you really want to delete this component?')) {
            context.store.dispatch({
              type: 'DELETE_COMPONENT',
              id, parent, index,
            })
          }
        }
      }
      onNodeAdd={
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
