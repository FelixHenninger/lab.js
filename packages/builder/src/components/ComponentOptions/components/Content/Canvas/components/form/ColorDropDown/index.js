import React, { useState } from 'react'

import { ButtonDropdown, DropdownToggle,
  DropdownMenu, DropdownItem } from 'reactstrap'
import { useField } from 'formik'

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

export default ({ name, disabled,
  icon, iconWeight, iconFallbackWeight }) => {

  const [dropdownOpen, setDropdownOpen] = useState(false)
  let hiddenColor = React.createRef()

  const [field, , helpers] = useField({ name })

  const choose = (color, setFieldValue) => {
    setDropdownOpen(false)
    helpers.setValue(color)
  }

  return <>
    <ButtonDropdown
      direction="up"
      isOpen={ dropdownOpen }
      toggle={ () => setDropdownOpen(!dropdownOpen) }
      style={{
        minWidth: '3.5rem',
      }}
    >
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
        <DropdownItem
          tag="div"
          style={{ height: '136px' }}
          toggle={ false }
        >
          {
            colors.map(c =>
              <Swatch
                key={ c } color={ c }
                clickHandler={ c => choose(c) }
              />
            )
          }
        </DropdownItem>
        <DropdownItem divider />
        {/* Grey values */}
        <DropdownItem
          tag="div"
          style={{ height: '90px' }}
          toggle={ false }
        >
          {
            grays.map(c =>
              <Swatch
                key={ c } color={ c }
                clickHandler={ c => choose(c) }
              />
            )
          }
        </DropdownItem>
        <DropdownItem divider />
        {/* Custom color selector */}
        <DropdownItem tag="div" toggle={ false }>
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
        <DropdownItem tag="div" toggle={ false }>
          <input
            type="text" placeholder="CSS color"
            className="form-control w-100 text-monospace"
            {...field}
          />
        </DropdownItem>
      </DropdownMenu>
    </ButtonDropdown>
    <input
      type="color"
      style={{ visibility: 'hidden', position: 'absolute' }}
      tabIndex={ -1 }
      ref={ hiddenColor }
      {...field}
    />
  </>
}
