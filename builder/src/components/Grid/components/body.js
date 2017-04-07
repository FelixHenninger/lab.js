import React from 'react'
import { actions } from 'react-redux-form'

import ButtonCell from './buttonCell'

const Cell = (
  { cellData, rowIndex, colIndex, colData, BodyContent }
) =>
  <td>
    <BodyContent
      cellData={ cellData }
      rowIndex={ rowIndex }
      colIndex={ colIndex }
      colData={ colData }
    />
  </td>

const Row = (
  { data, rowData, rowIndex, BodyContent, columns, model },
  { uniqueId, formDispatch }
) =>
  <tr>
    <ButtonCell
      icon="bars"
      onClick={ () => null }
    />
    {
      rowData.length > 0
        ? rowData.map((cellData, colIndex) =>
            <Cell
              key={ `grid_${ uniqueId }_cell_${ rowIndex }_${ colIndex }` }
              cellData={ cellData }
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
    />
  </tr>

Row.contextTypes = {
  formDispatch: React.PropTypes.func,
  uniqueId: React.PropTypes.string,
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
  uniqueId: React.PropTypes.string,
}

export default Body
