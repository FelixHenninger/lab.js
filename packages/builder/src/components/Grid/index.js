import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Fieldset, actions } from 'react-redux-form'

import { uniqueId } from 'lodash'
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

const defaultRightColumn = ({ data, rowIndex }, { readOnly, model, formDispatch }) =>
  <ButtonCell
    icon="trash"
    onClick={
      () => formDispatch(
        actions.change(
          `${ model }.rows`,
          data.filter((row, i) => i !== rowIndex)
        )
      )
    }
    disabled={ readOnly }
  />

defaultRightColumn.contextTypes = {
  formDispatch: PropTypes.func,
  model: PropTypes.string,
  readOnly: PropTypes.bool,
}

class Grid extends Component {
  constructor(props) {
    super(props)
    this.uniqueId = uniqueId('grid_')
  }

  getChildContext() {
    return {
      formDispatch: this.props.formDispatch,
      readOnly: this.props.readOnly,
      uniqueId: this.uniqueId,
    }
  }

  render() {
    const { columns, Footer } = this.props

    const columnWidths = this.props.columnWidths ||
      columns.length > 0
        ? columns.map(() => 90 / columns.length)
        : [90]

    const deleteColumn = index =>
      this.props.formDispatch(
        actions.change(
          `local${ this.props.model }`,
          {
            columns: columns.filter( (_, i) => i !== index ),
            rows: this.props.data.map(
              r => r.filter( (_, i) => i !== index)
            )
          }
        )
      )

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
            data={ this.props.data }
            columns={ columns }
            defaultColumn={ this.props.defaultColumn }
            addColumns={ this.props.addColumns }
            maxColumns={ this.props.maxColumns }
            HeaderContent={ this.props.HeaderContent }
            deleteColumn={ deleteColumn }
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
                  defaultRow={ this.props.defaultRow }
                />
          }
        </table>
      </Fieldset>
    )
  }
}

Grid.childContextTypes = {
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
