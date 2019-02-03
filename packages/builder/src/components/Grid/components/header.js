import React from 'react'
import PropTypes from 'prop-types'
import { actions } from 'react-redux-form'

import ButtonCell from './buttonCell'

const Header = (
  { columns, defaultColumn, addColumns, maxColumns,
    data, HeaderContent, deleteColumn },
  { uniqueId, formDispatch, model }
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
              type="th" icon="plus"
              style={{
                height: '42px',
              }}
              onClick={ // Add additional column to data
                () => formDispatch(
                  actions.change(
                    `${ model }`,
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
  formDispatch: PropTypes.func,
  model: PropTypes.string,
  uniqueId: PropTypes.string,
}

export default Header
