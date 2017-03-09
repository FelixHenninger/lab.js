import React, { Component } from 'react'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

/* TODO: Importing an external helper like this totally breaks
   the idea of decoupled components. For the moment, however,
   I have decided to not pass through another helper --
   rather the node component as a whole should be made
   pluggable, someday */
import { stateToDownload } from '../../../../../logic/io/save'
import './index.css'

export default class NodeDropDown extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.state = {
      dropdownOpen: false
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }

  render() {
    const { id, parent, index, onDelete } = this.props
    return (
      <Dropdown
        isOpen={this.state.dropdownOpen}
        toggle={this.toggle}
      >
        <DropdownToggle caret size="sm" />
        <DropdownMenu right>
          <DropdownItem header>Actions</DropdownItem>
          <DropdownItem
            onClick={ () => stateToDownload(
              this.context.store.getState(),
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
        </DropdownMenu>
      </Dropdown>
    )
  }
}

NodeDropDown.contextTypes = {
  store: React.PropTypes.object
}
