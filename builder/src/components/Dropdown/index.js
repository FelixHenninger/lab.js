import React, { Component } from 'react'
import { Dropdown, ButtonDropdown } from 'reactstrap'

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
    const WrappedDropdown = this.props.type === 'button'
      ? ButtonDropdown
      : Dropdown

    return <WrappedDropdown
      isOpen={this.state.dropdownOpen}
      toggle={this.toggle}
    >
      { this.props.children }
    </WrappedDropdown>
  }
}
