import React, { Component } from 'react'

import { DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

import DropDown from '../../../../../../../Dropdown'
import Icon from '../../../../../../../Icon'

import './index.css'

const Swatch = ({ color, clickHandler }) => {
  return <div
    className="color-swatch"
    onClick={ () => clickHandler(color) }
    style={{
      backgroundColor: color,
      border: `1px solid ${ color === '#ffffff' ? '#ccc' : color }`,
    }}
  />
}

export default class ColorDropdown extends Component {
  select(color, toggle=true) {
    if (toggle) {
      this.dropdown.toggle()
    }

    this.props.onChange(color)
  }

  render() {
    const colors = [
      '#0d3b83', '#0070d9', // blues
      '#12864e', '#a8ca09', // greens
      '#d6341a', '#fcbb0a', // red / yellow
    ]

    const grays = [
      '#ffffff', '#dddddd',
      '#aaaaaa', '#000000',
    ]

    return <DropDown
        direction="up"
        type="button"
        ref={ ref => this.dropdown = ref }
        style={{
          minWidth: '3.5rem',
        }}
      >
        {/* Hidden color input used to capture freely chosen colors */}
        <input type="color"
          /* For some weird reason, display: none won't work here */
          style={{ visibility: 'hidden', position: 'absolute' }}
          tabIndex={ -1 }
          ref={ ref => this.hiddenColor = ref }
          value={ this.props.value || '' }
          onChange={ () => this.select(this.hiddenColor.value, false) }
        />
        {/* Remainder of the Dropdown */}
        <DropdownToggle
          caret outline color="secondary"
          disabled={ this.props.disabled }
        >
          <Icon
            icon={ this.props.icon }
            weight={ this.props.iconWeight }
            fallbackWeight={ this.props.iconFallbackWeight }
            style={{ position: 'relative', top: '1px' }}
          />
        </DropdownToggle>
        <DropdownMenu right className="color-dropdown">
          {/* Predefined colors */}
          <div
            className="dropdown-item"
            style={{ height: '136px' }}
          >
            {
              colors.map(c =>
                <Swatch
                  key={ c } color={ c }
                  clickHandler={ c => this.select(c) }
                />
              )
            }
          </div>
          <DropdownItem divider />
          {/* Grey values */}
          <div
            className="dropdown-item"
            style={{ height: '90px' }}
          >
            {
              grays.map(c =>
                <Swatch
                  key={ c } color={ c }
                  clickHandler={ c => this.select(c) }
                />
              )
            }
          </div>
          <DropdownItem divider />
          {/* Custom color selector */}
          <div className="dropdown-item">
            <div
              className="btn btn-outline-secondary"
              style={{ width: '126px' }}
              onClick={ () => {
                this.hiddenColor.focus()
                this.hiddenColor.select()
                this.hiddenColor.click()
                this.dropdown.toggle()
              } }
            >
              <Icon icon="eye-dropper" />
            </div>
          </div>
          <DropdownItem divider />
          {/* Manual (text-based) color input */}
          <div className="dropdown-item">
            <input
              className="form-control w-100"
              style={{ fontFamily: 'Fira Mono' }}
              placeholder="CSS color"
              ref={ ref => this.manualColor = ref }
              value={ this.props.value || '' }
              onChange={ () => this.select(this.manualColor.value, false) }
            />
          </div>
        </DropdownMenu>
      </DropDown>
  }
}
