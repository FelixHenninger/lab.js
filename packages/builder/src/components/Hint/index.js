import React, { Component } from 'react'
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import { uniqueId } from 'lodash'

import Icon from '../Icon'

import './hint.css'

const HintTarget = ({ id, onClick }) =>
  <span id={ id } onClick={ onClick }>
    <Icon icon="info-circle" className="hint-icon" title="More information" />
    <span className="sr-only">More information</span>
  </span>

export default class HintPopover extends Component {
  constructor(props) {
    super(props)

    this.id = this.props.id || uniqueId('hint_')
    this.target = this.props.target || HintTarget

    this.toggle = this.toggle.bind(this)
    this.state = {
      isOpen: false,
    }
  }

  toggle(e) {
    if (e) {
      e.preventDefault()
    }

    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  render() {
    const Target = this.target

    return (
      <span className={ this.props.className } style={ this.props.style }>
        {' '}
        <Target id={ this.id } onClick={ this.toggle } />
        <Popover
          target={ this.id }
          placement={ this.props.placement || "bottom" }
          trigger="legacy"
          delay={0}
          isOpen={ this.state.isOpen } toggle={ this.toggle }
        >
          <PopoverHeader>{ this.props.title }</PopoverHeader>
          <PopoverBody>{ this.props.children }</PopoverBody>
        </Popover>
      </span>
    )
  }
}
