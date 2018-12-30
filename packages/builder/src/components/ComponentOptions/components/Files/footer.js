import React from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'
import { actions } from 'react-redux-form'

import FileSelector from '../../../FileSelector'
import Icon from '../../../Icon'

const Footer = (
  { columns, data, model },
  { formDispatch }
) => {
  let fileSelector

  return <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <FileSelector
          ref={ ref => fileSelector = ref }
        />
        <Button
          size="sm" block
          outline color="muted"
          className="hover-target"
          onClick={ () =>
            fileSelector
              .select()
              .then(({ localPath, poolPath }) =>
                formDispatch(
                  actions.change(
                    `local${ model }.rows`,
                    [...data, [{ localPath, poolPath }]]
                  )
                )
              )
              .catch(() => null)
          }
        >
          <Icon icon="plus" />
        </Button>
      </td>
      <td />
    </tr>
  </tfoot>
}

Footer.contextTypes = {
  formDispatch: PropTypes.func,
}

export default Footer
