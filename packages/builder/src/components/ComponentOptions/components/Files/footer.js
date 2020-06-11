import React from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'

import FileSelector from '../../../FileSelector'
import Icon from '../../../Icon'

const Footer = ({ addItem }, { id }) => {
  let fileSelector = React.createRef()

  return <tfoot>
    <tr>
      <td />
      <td>
        <FileSelector
          ref={ fileSelector }
          component={ id }
        />
        <Button
          size="sm" block
          outline color="muted"
          className="hover-target"
          onClick={ async () => {
            try {
              await fileSelector.current.select()
            } catch (error) {
              console.log('Error while adding file', error)
            }
          } }
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
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default Footer
