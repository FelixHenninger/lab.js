import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'
import { actions } from 'react-redux-form'

import Icon from '../../Icon'

const Footer = (
  { columns, data, defaultRow },
  { formDispatch, model }
) =>
  <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <Button
          block size="sm"
          outline color="muted"
          className="hover-target"
          onClick={
            () => formDispatch(
              actions.change(
                `${ model }.rows`,
                [
                  ...data,
                  defaultRow || Array // Create array of empty strings
                    .apply(null, Array(data[0] ? data[0].length : columns.length))
                    .map(String.prototype.valueOf, "")
                ]
              )
            )
          }
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
  formDispatch: PropTypes.func,
  model: PropTypes.string,
}

export default Footer
