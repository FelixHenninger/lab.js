import React from 'react'
import PropTypes from 'prop-types'
import Dropdown from '../../../../Dropdown'
import { DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

/* TODO: Importing an external helper like this totally breaks
   the idea of decoupled components. For the moment, however,
   I have decided to not pass through another helper --
   rather the node component as a whole should be made
   pluggable, someday */
import { stateToDownload } from '../../../../../logic/io/save'
import './index.css'

const NodeDropdown = ({ id, parent, index, onDelete, hasChildren }, context) =>
  <Dropdown>
    <DropdownToggle caret size="sm" />
    <DropdownMenu right>
      <DropdownItem header>Actions</DropdownItem>
      <DropdownItem
        onClick={ () => stateToDownload(
          context.store.getState(),
          id
        ) }
      >
        Export
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
                onClick={ () => {
                  context.store.dispatch({
                    type: 'COLLAPSE_COMPONENT', id
                  })
                } }
              >
                Collapse
              </DropdownItem>
            </div>
          : null
      }
    </DropdownMenu>
  </Dropdown>

NodeDropdown.contextTypes = {
  store: PropTypes.object
}

export default NodeDropdown
