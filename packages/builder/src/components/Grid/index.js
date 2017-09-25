import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Fieldset, actions } from 'react-redux-form'

import { uniqueId } from 'lodash'
import classnames from 'classnames'

import ColGroup from './components/colgroup'
import Header from './components/header'
import Body from './components/body'
import DefaultFooter from './components/footer'

import './index.css'

class Grid extends Component {
  constructor(props) {
    super(props)
    this.uniqueId = uniqueId('grid_')
  }

  getChildContext() {
    return {
      formDispatch: this.props.formDispatch,
      uniqueId: this.uniqueId,
    }
  }

  render() {
    const { model, data, columns, defaultRow } = this.props
    const HeaderContent = this.props.HeaderContent || (content => content)
    const BodyContent = this.props.BodyContent || (content => content)
    const Footer = this.props.Footer || DefaultFooter

    const addColumns = this.props.addColumns || false
    const maxColumns = this.props.maxColumns || Infinity
    const defaultColumn = this.props.defaultColumn || ''

    const columnWidths = this.props.columnWidths ||
      columns.length > 0
        ? columns.map(() => 90 / columns.length)
        : [90]

    const deleteColumn = index =>
      this.props.formDispatch(
        actions.change(
          `local${ model }`,
          {
            columns: columns.filter( (_, i) => i !== index ),
            rows: data.map(
              r => r.filter( (_, i) => i !== index)
            )
          }
        )
      )

    return (
      <Fieldset model={ model }>
        <table
          className={ classnames({
            'table': true,
            'grid': true,
            'grid-slim': columns.length > 5,
            'no-header': this.props.showHeader === false
          }) }
        >
          <ColGroup
            columnWidths={ columnWidths }
          />
          <Header
            data={ data }
            columns={ columns }
            model={ model }
            defaultColumn={ defaultColumn }
            addColumns={ addColumns }
            maxColumns={ maxColumns }
            HeaderContent={ HeaderContent }
            deleteColumn={ deleteColumn }
          />
          <Body
            data={ data }
            columns={ columns }
            model={ model }
            BodyContent={ BodyContent }
          />
          <Footer
            data={ data }
            columns={ columns }
            model={ model }
            defaultRow={ defaultRow }
          />
        </table>
      </Fieldset>
    )
  }
}

Grid.childContextTypes = {
  formDispatch: PropTypes.func,
  uniqueId: PropTypes.string,
}

export default Grid
