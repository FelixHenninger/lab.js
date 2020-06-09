import React from 'react'
import { useStore } from 'react-redux'
import { UncontrolledDropdown, DropdownToggle,
  DropdownMenu, DropdownItem } from 'reactstrap'

/* TODO: Importing an external helper like this totally breaks
   the idea of decoupled components. For the moment, however,
   I have decided to not pass through another helper --
   rather the node component as a whole should be made
   pluggable, someday */
import { stateToDownload } from '../../../../../logic/io/save'
import './index.css'
import { connect } from 'react-redux'

const NodeDropdown = ({
  id, parent, index,
  collapsed, hasChildren,
  onDelete, onDuplicate, collapseComponent,
}) => {
  const store = useStore()

  return (
    <UncontrolledDropdown>
      <DropdownToggle
        caret size="sm"
        outline color="secondary"
      />
      <DropdownMenu right>
        <DropdownItem header>Actions</DropdownItem>
        <DropdownItem
          onClick={ () => stateToDownload(
            store.getState(),
            { exportedComponent: id }
          ) }
        >
          Export
        </DropdownItem>
        <DropdownItem
          onClick={ () => onDuplicate(id, parent, index) }
        >
          Duplicate
        </DropdownItem>
        <DropdownItem
          onClick={ () => onDelete(id, parent, index) }
        >
          Delete
        </DropdownItem>
        {
          hasChildren
            ? <div>
                <DropdownItem divider/>
                <DropdownItem header>View</DropdownItem>
                <DropdownItem
                  onClick={ () => collapseComponent(id) }
                >
                  { collapsed ? 'Expand' : 'Collapse' }
                </DropdownItem>
              </div>
            : null
        }
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

// TODO: This is a duplicated action creator,
// refactor to share this with the Sidebar component
const mapDispatchToProps = {
  collapseComponent: (id) => ({
    type: 'COLLAPSE_COMPONENT', id
  })
}

export default connect(null, mapDispatchToProps)(NodeDropdown)
