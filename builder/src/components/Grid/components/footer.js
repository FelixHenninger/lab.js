import React from 'react'
import { Button } from 'reactstrap'
import { actions } from 'react-redux-form'

const Footer = (
  { columns, data, defaultRow, model },
  { formDispatch }
) =>
  <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <Button
          size="sm" block
          className="btn-add btn-muted"
          onClick={
            () => formDispatch(
              actions.change(
                `local${ model }.rows`,
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
          <i className="fa fa-plus"></i>
        </Button>
      </td>
      <td />
    </tr>
  </tfoot>

Footer.contextTypes = {
  formDispatch: React.PropTypes.func,
}

export default Footer
