import React, { Component } from 'react'
import { Dropdown, ButtonDropdown, InputGroupButtonDropdown } from 'reactstrap'
import { omit } from 'lodash'

export default class CustomDropdown extends Component {
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
    let WrappedDropdown
    switch (this.props.type) {
      case 'button':
        WrappedDropdown = ButtonDropdown
        break
      case 'input-group-button':
        WrappedDropdown = InputGroupButtonDropdown
        break
      default:
        WrappedDropdown = Dropdown
    }

    return <WrappedDropdown
      isOpen={ this.state.dropdownOpen }
      toggle={ this.toggle }
      { ...omit(this.props, 'type') }
    >
      { this.props.children }
    </WrappedDropdown>
  }
}
