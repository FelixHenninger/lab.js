import React from 'react'

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
  formDispatch: React.PropTypes.func,
  uniqueId: React.PropTypes.string,
}

export default ColGroup
