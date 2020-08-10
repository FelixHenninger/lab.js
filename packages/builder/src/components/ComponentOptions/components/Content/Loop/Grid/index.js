import React, { Fragment } from 'react'

import { FastField, useFormikContext } from 'formik'

import Header from './header'
import { Table, DefaultRow } from '../../../../../Form/table'

const Row = ({ index: rowIndex, name, data, arrayHelpers }) =>
  <DefaultRow
    index={ rowIndex } arrayHelpers={ arrayHelpers }
    wrapper={ Fragment }
  >
    { data.map(
      (_, columnIndex) =>
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
    row={ Row }
    columns={ columns }
    header={ Header }
    defaultItem={ Array(columns).fill('') }
    className="border-top-0"
  />
}
