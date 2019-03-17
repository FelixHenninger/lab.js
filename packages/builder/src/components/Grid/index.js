import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Fieldset, actions } from 'react-redux-form'

import { uniqueId, fill } from 'lodash'
import classnames from 'classnames'

import ButtonCell from './components/buttonCell'
import ColGroup from './components/colgroup'
import Header from './components/header'
import Body from './components/body'
import DefaultFooter from './components/footer'

import './index.css'

const defaultLeftColumn = (_, { readOnly }) =>
  <ButtonCell
    icon="bars"
    onClick={ () => null }
    disabled={ readOnly }
  />

defaultLeftColumn.contextTypes = {
  readOnly: PropTypes.bool,
}

const defaultRightColumn = ({ rowIndex }, { readOnly, gridDispatch }) =>
  <ButtonCell
    icon="trash"
    onClick={ () => gridDispatch('deleteRow', rowIndex) }
    disabled={ readOnly }
  />

defaultRightColumn.contextTypes = {
  gridDispatch: PropTypes.func,
  readOnly: PropTypes.bool,
}

class Grid extends Component {
  constructor(props) {
    super(props)
    this.uniqueId = uniqueId('grid_')
    this.dispatch = this.dispatch.bind(this)
  }

  getChildContext() {
    return {
      gridDispatch: this.dispatch,
      formDispatch: this.props.formDispatch,
      readOnly: this.props.readOnly,
      uniqueId: this.uniqueId,
    }
  }

  dispatch(action, payload) {
    switch(action) {
      case 'change':
        return this.handleChange(payload.model, payload.value)
      case 'addColumn':
        return this.handleColumnAdd()
      case 'deleteColumn':
        return this.handleColumnDelete(payload)
      case 'fillColumn':
        return this.handleColumnFill(payload)
      case 'addRow':
      case 'addRows':
        return this.handleRowAdd(payload)
      case 'deleteRow':
        return this.handleRowDelete(payload)
      case 'overwrite':
        return this.handleOverwrite(payload)
      case 'reload':
        return this.handleReload()
      default:
        return
    }
  }

  handleChange(model, value) {
    this.props.formDispatch(
      actions.change(model, value)
    )
  }

  handleColumnAdd() {
    this.handleChange(
      `local${ this.props.model }`,
      {
        columns: [...this.props.columns, this.props.defaultColumn],
        rows: this.props.data.map(row => [...row, '']),
      }
    )
  }

  handleColumnDelete(index) {
    this.handleChange(
      `local${ this.props.model }`,
      {
        columns: this.props.columns.filter( (_, i) => i !== index ),
        rows: this.props.data.map(
          r => r.filter( (_, i) => i !== index)
        )
      }
    )
  }

  handleColumnFill(colIndex) {
    // Gather cells with content
    const availableCells = this.props.data
      .map(r => r[colIndex])
      .filter(r => r !== '')

    if (availableCells.length > 0) {
      // Impute remaining cells based on available data
      this.handleChange(
        `local${ this.props.model }`,
        {
          columns: this.props.columns,
          rows: this.props.data.map(
            (r, rowIndex) => {
              const output = [...r]
              output[colIndex] = output[colIndex] ||
                availableCells[rowIndex % availableCells.length]
              return output
            }
          )
        }
      )
    }
  }

  handleRowAdd(newRows) {
    const addition = newRows || (
      this.props.defaultRow
        ? [this.props.defaultRow]
        : [fill( // As a fallback, add an array of empty strings
            Array(
              this.props.data[0]
                ? this.props.data[0].length
                : this.props.columns.length
            ),
            ''
          )]
    )

    this.handleChange(
      `local${ this.props.model }.rows`,
      [
        ...this.props.data,
        ...addition,
      ]
    )
  }

  handleRowDelete(index) {
    this.handleChange(
      `local${ this.props.model }.rows`,
      this.props.data.filter((_, i) => i !== index)
    )
  }

  handleOverwrite({ columns, rows }) {
    this.handleChange(
      `local${ this.props.model }`,
      { columns, rows }
    )
  }

  handleReload() {
    // Note that this reloads the grid content (rows) only
    this.props.formDispatch(
      actions.load(
        `local${ this.props.model }.rows`,
        this.props.data,
      )
    )
  }

  render() {
    const { columns, Footer } = this.props

    const columnWidths = this.props.columnWidths ||
      columns.length > 0
        ? columns.map(() => 90 / columns.length)
        : [90]

    return (
      <Fieldset model={ this.props.model }>
        <table
          className={ classnames({
            'table': true,
            'grid': true,
            'grid-slim': columns.length > 5,
            'no-header': this.props.showHeader === false
          }, this.props.className) }
        >
          <ColGroup
            columnWidths={ columnWidths }
          />
          <Header
            columns={ columns }
            addColumns={ this.props.addColumns }
            maxColumns={ this.props.maxColumns }
            HeaderContent={ this.props.HeaderContent }
          />
          <Body
            data={ this.props.data }
            columns={ columns }
            BodyContent={ this.props.BodyContent }
            LeftColumn={ this.props.LeftColumn }
            RightColumn={ this.props.RightColumn }
            cellProps={ this.props.cellProps }
          />
          {
            this.props.readOnly
              ? null
              : <Footer
                  data={ this.props.data }
                  columns={ columns }
                />
          }
        </table>
      </Fieldset>
    )
  }
}

Grid.childContextTypes = {
  gridDispatch: PropTypes.func,
  formDispatch: PropTypes.func,
  readOnly: PropTypes.bool,
  uniqueId: PropTypes.string,
}

Grid.defaultProps = {
  addColumns: false,
  maxColumns: Infinity,
  defaultColumn: '',
  cellProps: {},
  LeftColumn: defaultLeftColumn,
  RightColumn: defaultRightColumn,
  HeaderContent: content => content,
  BodyContent: content => content,
  Footer: DefaultFooter,
}

export default Grid
