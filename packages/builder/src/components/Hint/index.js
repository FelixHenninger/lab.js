import React, { Component } from 'react'
import { Popover, PopoverTitle, PopoverContent } from 'reactstrap'
import { uniqueId } from 'lodash'

import './hint.css'

export default class HintPopover extends Component {
  constructor(props) {
    super(props)

    this.id = this.props.id || uniqueId('hint_')

    this.toggle = this.toggle.bind(this)
    this.state = {
      isOpen: false,
    }
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  render() {
    return (
      <span className={ this.props.className } style={ this.props.style }>
        {' '}
        <span id={ this.id } onClick={ this.toggle }>
          <i className="fa fa-info-circle hint-icon"
            style={{ color: 'rgba(0, 0, 0, 0.2)' }}
            aria-hidden="true" title="More information"></i>
          <span className="sr-only">More information</span>
        </span>
        <Popover
          target={ this.id }
          placement={ this.props.placement || "bottom" }
          isOpen={ this.state.isOpen } toggle={ this.toggle }>
          <PopoverTitle>{ this.props.title }</PopoverTitle>
          <PopoverContent>{ this.props.children }</PopoverContent>
        </Popover>
      </span>
    )
  }
}
