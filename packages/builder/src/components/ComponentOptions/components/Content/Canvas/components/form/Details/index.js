import React, { useState } from 'react'

import { ButtonDropdown, DropdownToggle } from 'reactstrap'

import Icon from '../../../../../../../Icon'

import AoiOptions from './AoiOptions'
import ImageOptions from './ImageOptions'
import TextOptions from './TextOptions'

import './index.css'

const icons = {
  'aoi': 'bullseye-pointer',
  'i-text': 'font',
  'image': 'image',
}

const Toggle = ({ type }) =>
  <DropdownToggle
    caret outline color="secondary"
    disabled={ !Object.keys(icons).includes(type) }
    style={{
      minWidth: '3.5rem',
    }}
  >
    <Icon icon={ icons[type] || 'cog' } />
  </DropdownToggle>

const Options = (props) => {
  switch(props.selection.type) {
    case 'aoi':
      return <AoiOptions { ...props } />
    case 'i-text':
      return <TextOptions { ...props } />
    case 'image':
      return <ImageOptions { ...props } />
    default:
      return null
  }
}

export default ({ selection, changeHandler }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <ButtonDropdown
      direction="up"
      isOpen={ dropdownOpen }
      toggle={ () => setDropdownOpen(!dropdownOpen) }
      // Don't close the dropdown menu on any click
      // (otherwise, clicking inside the modal triggers
      // the toggle. Note that this is a hack, because
      // this property happens to do what we want,
      // but that is not guaranteed)
      inNavbar={ true }
    >
      <Toggle
        type={ selection.type }
      />
      <Options
        selection={ selection }
        changeHandler={ changeHandler }
        toggle={ () => setDropdownOpen(false) }
      />
    </ButtonDropdown>
  )
}
