import React, { useState } from 'react'

import { InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  InputGroup } from 'reactstrap'
import classnames from 'classnames'

import Icon from '../../../../../Icon'
import { FastField, useField } from 'formik'

const CellTypeDropdown = ({ name, disabled=false }) => {
  const [field, , helpers] = useField(name)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <InputGroupButtonDropdown
      addonType="append"
      disabled={ disabled }
      isOpen={ dropdownOpen }
      toggle={ () => setDropdownOpen(!dropdownOpen) }
    >
      <DropdownToggle
        caret={ !disabled }
        disabled={ disabled }
        outline color="secondary"
        // Ensure that the right-hand side always has rounded corners
        // (this didn't work if the button was disabled)
        className="rounded-right"
      >
        <Icon
          icon={{
            string: 'font',
            number: 'tachometer',
            boolean: 'adjust'
          }[field.value]}
          fixedWidth
        />
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem header>Data type</DropdownItem>
        <DropdownItem
          className={ classnames({
            'dropdown-item-active': field.value === 'string'
          }) }
          onClick={ () => helpers.setValue('string') }
        >
          Text <span className="text-muted">(categorical)</span>
        </DropdownItem>
        <DropdownItem
          className={ classnames({
            'dropdown-item-active': field.value === 'number'
          }) }
          onClick={ () => helpers.setValue('number') }
        >
          Numerical <span className="text-muted">(continuous)</span>
        </DropdownItem>
        <DropdownItem
          className={ classnames({
            'dropdown-item-active': field.value === 'boolean'
          }) }
          onClick={ () => helpers.setValue('boolean') }
        >
          Boolean <span className="text-muted">(binary)</span>
        </DropdownItem>
      </DropdownMenu>
    </InputGroupButtonDropdown>
  )
}

export const HeaderCell = ({ index }) =>
  <InputGroup>
    <FastField
      name={ `templateParameters.columns[${ index }].name` }
      placeholder={ `parameter${ index }` }
      className="form-control text-monospace font-weight-bolder"
      style={{ height: '42px' }}
    />
    <CellTypeDropdown name={ `templateParameters.columns[${ index }].type` } />
  </InputGroup>

export default ({ name, columns }) =>
  <thead>
    <tr>
      <th></th>
      { Array(columns).fill(null).map((_, i) =>
        <th key={ `${ name }-header-${ i }` }>
          <HeaderCell index={ i } />
        </th>
      ) }
      <th></th>
    </tr>
  </thead>
