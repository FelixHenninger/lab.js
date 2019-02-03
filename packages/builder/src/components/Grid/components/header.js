import React from 'react'
import PropTypes from 'prop-types'

import ButtonCell from './buttonCell'

const Header = (
  { columns, addColumns, maxColumns, HeaderContent },
  { uniqueId, gridDispatch }
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
              onClick={ () => gridDispatch('addColumn') }
            />
      }
    </tr>
  </thead>

Header.contextTypes = {
  gridDispatch: PropTypes.func,
  uniqueId: PropTypes.string,
}

export default Header
