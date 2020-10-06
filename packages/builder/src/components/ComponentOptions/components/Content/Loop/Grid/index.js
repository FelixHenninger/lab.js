import React, { Fragment } from 'react'

import { FastField, useFormikContext } from 'formik'
import classnames from 'classnames'
import { range } from 'lodash'

import { Table, DefaultRow } from '../../../../../Form/table'
import Header from './header'
import Footer from './footer'

import './style.css'

const Row = ({ index: rowIndex, name, columns, arrayHelpers }) =>
  <DefaultRow
    index={ rowIndex } arrayHelpers={ arrayHelpers }
    wrapper={ Fragment }
  >
    { range(columns).map(columnIndex =>
      <td key={ `${ name }[${ columnIndex }]` }>
        <FastField
          name={ `${ name }[${ columnIndex }]` }
          className="form-control text-monospace"
        />
      </td>
    ) }
  </DefaultRow>

export default () => {
  const { values } = useFormikContext()
  const { templateParameters } = values
  const columns = templateParameters.columns.length

  return <Table
    name="templateParameters.rows"
    columns={ columns }
    row={ Row }
    header={ Header }
    footer={ Footer }
    defaultItem={ Array(columns).fill('') }
    className={ classnames({
      'table': true,
      'grid': true,
      'grid-slim': columns > 5,
      'border-top-0 border-bottom': true,
    }) }
  />
}
