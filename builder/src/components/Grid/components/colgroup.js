import React from 'react'
import PropTypes from 'prop-types'

const ColGroup = ({ columnWidths }, { uniqueId }) =>
  <colgroup>
    <col style={{ width: '5%' }} />
    {
      columnWidths.map(
        (pct, i) => <col
          key={ `grid_${ uniqueId }_colgroup_${ i }` }
          style={{ width: `${ pct }%` }}
        />
      )
    }
    <col style={{ width: '5%' }} />
  </colgroup>

ColGroup.contextTypes = {
  formDispatch: PropTypes.func,
  uniqueId: PropTypes.string,
}

export default ColGroup
