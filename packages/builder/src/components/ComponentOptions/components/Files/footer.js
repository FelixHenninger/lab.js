import React from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'

import FileSelector from '../../../FileSelector'
import Icon from '../../../Icon'

const Footer = ({ columns }, { id, gridDispatch }) => {
  let fileSelector = React.createRef()

  return <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <FileSelector
          ref={ fileSelector }
          component={ id }
        />
        <Button
          size="sm" block
          outline color="muted"
          className="hover-target"
          onClick={ () => fileSelector.current
            .select()
            .then(() => gridDispatch('reload'))
            .catch(() => null)
          }
          onMouseUp={ e => e.target.blur() }
        >
          <Icon icon="plus" />
        </Button>
      </td>
      <td />
    </tr>
  </tfoot>
}

Footer.contextTypes = {
  gridDispatch: PropTypes.func,
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default Footer
