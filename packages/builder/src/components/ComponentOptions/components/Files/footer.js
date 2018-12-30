import React from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'
import { actions } from 'react-redux-form'

import FileSelector from '../../../FileSelector'
import Icon from '../../../Icon'

const Footer = (
  { columns, data, model },
  { formDispatch, id }
) => {
  let fileSelector

  return <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <FileSelector
          ref={ ref => fileSelector = ref }
          component={ id }
          addToComponent={ false }
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
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default Footer
