import React from 'react'
import { actions } from 'react-redux-form'

import ButtonCell from './buttonCell'

const Header = (
  { columns, defaultColumn, addColumns, maxColumns,
    data, HeaderContent, deleteColumn, model },
  { uniqueId, formDispatch }
) =>
  <thead>
    <tr>
      <th />
      {
        columns.length > 0
          ? columns.map(
              (columnData, index) =>
                <th key={ `grid_${ uniqueId }_column_${ index }` }>
                  <HeaderContent
                    columnData={ columnData }
                    index={ index }
                    deleteColumn={ () => deleteColumn(index) }
                  />
                </th>
            )
          : <th/>
      }
      {
        !(addColumns && columns.length < maxColumns)
          ? <th />
          : <ButtonCell
              type="th"
              icon="plus"
              onClick={ // Add additional column to data
                () => formDispatch(
                  actions.change(
                    `local${ model }`,
                    {
                      columns: [...columns, defaultColumn],
                      rows: data.map(row => [...row, '']),
                    }
                  )
                )
              }
            />
      }
    </tr>
  </thead>

Header.contextTypes = {
  formDispatch: React.PropTypes.func,
  uniqueId: React.PropTypes.string,
}

export default Header
