import React from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'

import Icon from '../../../../../Icon'

const icons = {
  'text': 'info',
  'input': 'comment-alt-minus',
  'radio': 'list-ul',
  'checkbox': 'tasks',
}

export const LeftColumn = ({ rowData: [{ type }] }) =>
  <td>
    {
      type !== 'divider'
        ? <div
            className="text-center text-black-50"
            style={{
              padding: '6px 12px',
              border: '1px solid transparent',
              position: 'relative',
              top: '1px',
            }}
          >
            <Icon icon={ icons[type] || 'question' } />
          </div>
        : null
    }
    <Button
      block outline color="muted"
      style={{ marginTop: type !== 'divider' ? '8px' : undefined }}
    >
      <Icon icon="bars" />
    </Button>
  </td>

export const RightColumn = (
  { rowIndex, rowData: [{ type }] },
  { gridDispatch }
) =>
  <td>
    {
      type !== 'divider'
        ? <Button
            block outline color="muted"
          >
            <Icon icon="cog" />
          </Button>
        : null
    }
    <Button
      block outline color="muted"
      onClick={ () => gridDispatch('deleteRow', rowIndex) }
    >
      <Icon icon="trash" />
    </Button>
  </td>

RightColumn.contextTypes = {
  gridDispatch: PropTypes.func,
}
