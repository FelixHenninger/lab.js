import React, { Component } from 'react'
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

import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
         InputGroup, InputGroupButton } from 'reactstrap'
import classnames from 'classnames'

class CellTypeSelector extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.state = {
      dropdownOpen: false
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }

  render() {
    return (
      <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>
          <i
            className={ classnames({
              'fa': true,
              'fa-font': this.props.type === 'string',
              'fa-tachometer': this.props.type === 'number',
              'fa-adjust': this.props.type === 'boolean',
            }) }
          />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Data type</DropdownItem>
          <DropdownItem
            className={ classnames({
              'dropdown-item-active': this.props.type === 'string'
            }) }
            onClick={ () => this.props.setType('string') }
          >
            Text <span className="text-muted">(categorical)</span>
          </DropdownItem>
          <DropdownItem
            className={ classnames({
              'dropdown-item-active': this.props.type === 'number'
            }) }
            onClick={ () => this.props.setType('number') }
          >
            Numerical <span className="text-muted">(continuous)</span>
          </DropdownItem>
          <DropdownItem
            className={ classnames({
              'dropdown-item-active': this.props.type === 'boolean'
            }) }
            onClick={ () => this.props.setType('boolean') }
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
                this.props.delete()
              }
            } }
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    )
  }
}

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
