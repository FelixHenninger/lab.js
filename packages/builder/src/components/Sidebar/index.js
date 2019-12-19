import PropTypes from 'prop-types'
import React from 'react'
import Tree from '../Tree'
import Node from '../Tree/components/Node'

const Sidebar = (props, context) => (
  <>
    <Tree
      Node={Node}
      rootId="root"
      onNodeClick={(e, id) => {
        // Collapse view if shift key is pressed
        if (e.shiftKey) {
          context.store.dispatch({
            type: 'COLLAPSE_COMPONENT',
            id,
          })
        } else {
          context.store.dispatch({
            type: 'SHOW_COMPONENT_DETAIL',
            id,
          })
        }
      }}
      onNodeDelete={(id, parent, index) => {
        if (window.confirm('Do you really want to delete this component?')) {
          context.store.dispatch({
            type: 'DELETE_COMPONENT',
            id,
            parent,
            index,
          })
        }
      }}
      onNodeAdd={(parent, index) =>
        context.store.dispatch({
          type: 'SHOW_MODAL',
          modalType: 'ADD_COMPONENT',
          modalProps: {
            parent: parent,
            index: index,
          },
        })
      }
    />
  </>
)

Sidebar.contextTypes = {
  store: PropTypes.object,
}

export default Sidebar
