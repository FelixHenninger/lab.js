import React, { useState } from 'react'

import { ButtonDropdown, DropdownToggle,
  DropdownMenu, DropdownItem } from 'reactstrap'

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

const colors = [
  '#0d3b83', '#0070d9', // blues
  '#12864e', '#a8ca09', // greens
  '#d6341a', '#fcbb0a', // red / yellow
]

const grays = [
  '#ffffff', '#dddddd',
  '#aaaaaa', '#000000',
]

export default ({ value, onChange, disabled,
  icon, iconWeight, iconFallbackWeight }) => {

  const [dropdownOpen, setDropdownOpen] = useState(false)
  let hiddenColor = React.createRef();
  let manualColor = React.createRef();

  const choose = (color, close=true) => {
    onChange(color)
    if (close)
      setDropdownOpen(false)
  }

  return (
    <ButtonDropdown
      direction="up"
      isOpen={ dropdownOpen }
      toggle={ () => setDropdownOpen(!dropdownOpen) }
      style={{
        minWidth: '3.5rem',
      }}
    >
      {/* Hidden color input used to capture freely chosen colors */}
      <input type="color"
        /* For some weird reason, display: none won't work here */
        style={{ visibility: 'hidden', position: 'absolute' }}
        tabIndex={ -1 }
        ref={ hiddenColor }
        value={ value || '' }
        onChange={ () => choose(hiddenColor.current.value, false) }
      />
      {/* Remainder of the Dropdown */}
      <DropdownToggle
        caret outline color="secondary"
        className="border-left-0"
        disabled={ disabled }
      >
        <Icon
          icon={ icon }
          weight={ iconWeight }
          fallbackWeight={ iconFallbackWeight }
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
                clickHandler={ c => choose(c) }
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
                clickHandler={ c => choose(c) }
              />
            )
          }
        </div>
        <DropdownItem divider />
        {/* Custom color selector */}
        <DropdownItem toggle={ false }>
          <div
            className="btn btn-outline-secondary"
            style={{ width: '126px' }}
            onClick={ () => {
              hiddenColor.current.focus()
              hiddenColor.current.select()
              hiddenColor.current.click()
              setDropdownOpen(!dropdownOpen)
            } }
          >
            <Icon icon="eye-dropper" />
          </div>
        </DropdownItem>
        <DropdownItem divider />
        {/* Manual (text-based) color input */}
        <DropdownItem toggle={ false }>
          <input
            className="form-control w-100"
            style={{ fontFamily: 'Fira Mono' }}
            placeholder="CSS color"
            ref={ manualColor }
            value={ value || '' }
            onChange={ () => choose(manualColor.current.value, false) }
          />
        </DropdownItem>
      </DropdownMenu>
    </ButtonDropdown>
  )
}
