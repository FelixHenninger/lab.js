import React from 'react'
import PropTypes from 'prop-types'
import { Control, actions } from 'react-redux-form'

import './style.css'

import Dropdown from '../../../../Dropdown'
import { DropdownToggle, DropdownMenu, DropdownItem,
         InputGroup, InputGroupButton } from 'reactstrap'
import classnames from 'classnames'

export const GridCell = ({ cellData, rowIndex, colIndex, colName }) =>
  <Control.text
    model={ `.rows[${ rowIndex }][${ colIndex }]` }
    className="form-control"
    style={{
      fontFamily: 'Fira Mono',
    }}
    debounce={ 300 }
  />

const CellTypeSelector = ({ type, setType, delete: deleteHandler }) =>
  <Dropdown type='button'>
    <DropdownToggle caret outline color="secondary">
      <i
        className={ classnames({
          'fa': true,
          'fa-font': type === 'string',
          'fa-tachometer': type === 'number',
          'fa-adjust': type === 'boolean',
        }) }
      />
    </DropdownToggle>
    <DropdownMenu>
      <DropdownItem header>Data type</DropdownItem>
      <DropdownItem
        className={ classnames({
          'dropdown-item-active': type === 'string'
        }) }
        onClick={ () => setType('string') }
      >
        Text <span className="text-muted">(categorical)</span>
      </DropdownItem>
      <DropdownItem
        className={ classnames({
          'dropdown-item-active': type === 'number'
        }) }
        onClick={ () => setType('number') }
      >
        Numerical <span className="text-muted">(continuous)</span>
      </DropdownItem>
      <DropdownItem
        className={ classnames({
          'dropdown-item-active': type === 'boolean'
        }) }
        onClick={ () => setType('boolean') }
      >
        Boolean <span className="text-muted">(binary)</span>
      </DropdownItem>
      <DropdownItem divider />
      <DropdownItem header>
        Actions
      </DropdownItem>
      <DropdownItem
        onClick={ () => {
          if (window.confirm('Are you sure you want to delete this column?')) {
            deleteHandler()
          }
        } }
      >
        Delete
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>

export const HeaderCell = ({ columnData, index, deleteColumn }, { formDispatch }) =>
  <InputGroup>
    <Control.text
      model={ `.columns[${ index }]['name']` }
      placeholder={ `parameter${ index }` }
      className="form-control"
      style={{
        fontFamily: 'Fira Mono',
        fontWeight: 'bold',
      }}
      debounce={ 300 }
    />
    <InputGroupButton>
      <CellTypeSelector
        type={ columnData.type }
        setType={
          value => formDispatch(
            actions.change(
              `local.templateParameters.columns[${ index }]['type']`,
              value
            )
          )
        }
        delete={ deleteColumn }
      />
    </InputGroupButton>
  </InputGroup>

HeaderCell.contextTypes = {
  formDispatch: PropTypes.func,
}
