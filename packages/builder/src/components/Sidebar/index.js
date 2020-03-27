import React from 'react'
import { connect } from 'react-redux'

import Toolbar from '../Toolbar'
import Tree from '../Tree'
import Node from '../Tree/components/Node'

const Sidebar = ({
  collapseComponent, deleteComponent, duplicateComponent,
  showComponentDetail, showAddModal
}) =>
  <>
    <div style={{ textAlign: 'center' }}>
      <Toolbar />
    </div>
    <hr style={{ marginBottom: '14px' }} />
    <Tree
      Node={ Node }
      rootId="root"
      onNodeClick={
        (e, id) => {
          // Collapse view if shift key is pressed
          if (e.shiftKey) {
            collapseComponent(id)
          } else {
            showComponentDetail(id)
          }
        }
      }
      onNodeDelete={
        (id, parent, index) => {
          if (window.confirm('Do you really want to delete this component?')) {
            deleteComponent(id, parent, index)
          }
        }
      }
      onNodeDuplicate={ duplicateComponent }
      onNodeAdd={ showAddModal }
    />
  </>

const mapDispatchToProps = {
  collapseComponent: (id) => ({
    type: 'COLLAPSE_COMPONENT', id,
  }),
  deleteComponent: (id, parent, index) => ({
    type: 'DELETE_COMPONENT',
    id, parent, index,
  }),
  duplicateComponent: (id, parent, index) => ({
    type: 'COPY_COMPONENT',
    id, parent,
    index: index+1,
  }),
  showComponentDetail: (id) => ({
    type: 'SHOW_COMPONENT_DETAIL', id,
  }),
  showAddModal: (parent, index) => ({
    type: 'SHOW_MODAL',
    modalType: 'ADD_COMPONENT',
    modalProps: {
      parent: parent,
      index: index,
    },
  })
}

export default connect(null, mapDispatchToProps)(Sidebar)
