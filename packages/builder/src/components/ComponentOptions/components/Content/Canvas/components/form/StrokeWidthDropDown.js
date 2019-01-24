import React from 'react'

import { DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

import DropDown from '../../../../../../Dropdown'
import Icon from '../../../../../../Icon'

const Line = ({ height }) =>
  <div
    className="w-100"
    style={{
      backgroundColor: 'black',
      height: height
    }}
  />

export default ({ onChange, disabled }) =>
  <DropDown
    type="button"
    direction="up"
    style={{
      minWidth: '3.5rem',
    }}
  >
    <DropdownToggle caret outline color="secondary" disabled={ disabled }>
      <Icon
        icon="paint-brush"
        style={{
          fontSize: '0.9em',
        }}
      />
    </DropdownToggle>
    <DropdownMenu>
      <DropdownItem
        onClick={ () => onChange(0) }
      >
        No line
      </DropdownItem>
      <DropdownItem divider />
      {
        [2, 5, 10].map(width =>
          <DropdownItem
            key={ `strokeWidthDropDown-${ width }` }
            style={{ paddingTop: '10px', paddingBottom: '10px' }}
            onClick={ () => onChange(width) }
          >
            <Line height={ `${ width }px` } />
          </DropdownItem>
        )
      }
    </DropdownMenu>
  </DropDown>
