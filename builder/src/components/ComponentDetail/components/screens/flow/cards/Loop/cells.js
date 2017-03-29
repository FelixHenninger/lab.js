import React from 'react'
import { Control, actions } from 'react-redux-form'

import './style.css'

export const gridCell = (cellData, rowIndex, colIndex, colName) =>
  <Control.text
    model={ `.rows[${ rowIndex }][${ colIndex }]` }
    className="form-control"
    style={{
      fontFamily: 'Fira Mono',
    }}
  />

import Dropdown from '../../../../../../Dropdown'
import { DropdownToggle, DropdownMenu, DropdownItem,
         InputGroup, InputGroupButton } from 'reactstrap'
import classnames from 'classnames'

const CellTypeSelector = ({ type, setType, delete: deleteHandler }) =>
  <Dropdown type='button'>
    <DropdownToggle caret>
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
          if (confirm('Are you sure you want to delete this column?')) {
            deleteHandler()
          }
        } }
      >
        Delete
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>

export const headerCell = (data, index, formDispatch, deleteColumn) =>
  <InputGroup>
    <Control.text
      model={ `.columns[${ index }]['name']` }
      placeholder={ `parameter${ index }` }
      className="form-control"
      style={{
        fontFamily: 'Fira Mono',
      }}
    />
    <InputGroupButton>
      <CellTypeSelector
        type={ data.type }
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
