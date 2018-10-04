import React from 'react'
import PropTypes from 'prop-types'
import { actions } from 'react-redux-form'

import ButtonCell from './buttonCell'

const Cell = (
  { cellData, cellProps, rowIndex, colIndex, colData, BodyContent }
) =>
  <td>
    <BodyContent
      cellData={ cellData }
      rowIndex={ rowIndex }
      colIndex={ colIndex }
      colData={ colData }
      { ...cellProps }
    />
  </td>

const Row = (
  { data, rowData, rowIndex, BodyContent, columns, model, readOnly, cellProps },
  { uniqueId, formDispatch }
) =>
  <tr>
    <ButtonCell
      icon="bars"
      onClick={ () => null }
      disabled={ readOnly }
    />
    {
      rowData.length > 0
        ? rowData.map((cellData, colIndex) =>
            <Cell
              key={ `grid_${ uniqueId }_cell_${ rowIndex }_${ colIndex }` }
              cellData={ cellData }
              cellProps={ cellProps }
              rowIndex={ rowIndex }
              colIndex={ colIndex }
              colName={ columns[colIndex] }
              BodyContent={ BodyContent }
            />
          )
        : <td />
    }
    <ButtonCell
      icon="trash"
      onClick={
        () => formDispatch(
          actions.change(
            `local${ model }.rows`,
            data.filter((row, i) => i !== rowIndex)
          )
        )
      }
      disabled={ readOnly }
    />
  </tr>

Row.contextTypes = {
  formDispatch: PropTypes.func,
  uniqueId: PropTypes.string,
}

const Body = (props, { uniqueId }) =>
  <tbody>
  {
    props.data.map((rowData, rowIndex) =>
      <Row
        key={ `grid_${ uniqueId }_row_${ rowIndex }` }
        rowData={ rowData }
        rowIndex={ rowIndex }
        { ...props }
      />
    )
  }
  </tbody>

Body.contextTypes = {
  uniqueId: PropTypes.string,
}

export default Body
