import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'

import Icon from '../../Icon'

const Footer = ({ columns }, { gridDispatch }) =>
  <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <Button
          block size="sm"
          outline color="muted"
          className="hover-target"
          onClick={ () => gridDispatch('addRow') }
          onMouseUp={
            e => e.target.blur()
          }
        >
          <Icon icon="plus" />
        </Button>
      </td>
      <td />
    </tr>
  </tfoot>

Footer.contextTypes = {
  gridDispatch: PropTypes.func,
}

export default Footer
