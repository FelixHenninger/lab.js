import React from 'react'
import PropTypes from 'prop-types'
import { Control, actions } from 'react-redux-form'

import './style.css'

import { DropdownToggle, DropdownMenu, DropdownItem,
  InputGroup } from 'reactstrap'
import classnames from 'classnames'

import Dropdown from '../../../../Dropdown'
import Icon from '../../../../Icon'

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
  <Dropdown type="input-group-button" addonType="append">
    <DropdownToggle caret outline color="secondary">
      <Icon
        icon={{
          string: 'font',
          number: 'tachometer',
          boolean: 'adjust'
        }[type]}
      />
    </DropdownToggle>
    <DropdownMenu right>
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
  </InputGroup>

HeaderCell.contextTypes = {
  formDispatch: PropTypes.func,
}
