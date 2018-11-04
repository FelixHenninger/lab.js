import React from 'react'
import PropTypes from 'prop-types'

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
  { data, rowData, rowIndex,
    BodyContent, LeftColumn, RightColumn,
    columns, model, readOnly, cellProps },
  { uniqueId, formDispatch }
) =>
  <tr>
    <LeftColumn
      data={ data }
      rowData={ rowData }
      rowIndex={ rowIndex }
      readOnly={ readOnly }
      model={ model }
      formDispatch={ formDispatch }
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
    <RightColumn
      data={ data }
      rowData={ rowData }
      rowIndex={ rowIndex }
      readOnly={ readOnly }
      model={ model }
      formDispatch={ formDispatch }
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
