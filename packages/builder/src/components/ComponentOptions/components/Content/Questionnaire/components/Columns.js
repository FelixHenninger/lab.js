import React from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'
import Icon from '../../../../../Icon'

import { ItemContext } from '../index'

const icons = {
  'text': 'info',
  'input': 'comment-alt-minus',
  'textarea': 'comment-alt-lines',
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
  { rowIndex, rowData: [{ type }], onClickOptions },
  { gridDispatch }
) =>
  <td>
    {
      type !== 'divider'
        ? <ItemContext.Consumer>
            {
              ({ openItem, setOpenItem }) =>
                <Button
                  block outline color="muted"
                  onClick={ () => {
                    // TODO: Think about moving logic into the ItemContext
                    if (openItem === rowIndex) {
                      setOpenItem(undefined)
                    } else {
                      setOpenItem(rowIndex)
                    }
                  } }
                >
                  <Icon icon="cog" />
                </Button>
            }
          </ItemContext.Consumer>

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
