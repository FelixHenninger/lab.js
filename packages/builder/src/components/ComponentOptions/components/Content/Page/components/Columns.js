import React from 'react'
import PropTypes from 'prop-types'

import { Button, Collapse } from 'reactstrap'
import Icon from '../../../../../Icon'

import { ItemContext } from '../index'

const icons = {
  'text': 'info',
  'divider': 'horizontal-rule', // could be page-break
  'input': 'comment-alt-minus',
  'textarea': 'comment-alt-lines',
  'radio': 'list-ul',
  'checkbox': 'tasks',
}

export const LeftColumn = (
  { rowData: [{ type }], rowIndex, isFirstRow, isLastRow },
  { gridDispatch }
) =>
  <td>
    <ItemContext.Consumer>
      {
        ({ openItem, setOpenItem }) =>
          <>
            {
              <div
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
            }
            {
              <Collapse isOpen={ openItem === rowIndex && type !== 'divider' }>
                <Button
                  block
                  outline color="muted"
                  className="mt-2"
                >
                  <Icon icon="bars" />
                </Button>
                <Button
                  block
                  outline color="muted"
                  className="mt-2"
                  onClick={ () => {
                    const o = openItem
                    setOpenItem(undefined)
                    gridDispatch(
                      'moveRow',
                      { from: rowIndex, to: rowIndex - 1 }
                    )
                    setOpenItem(o - 1)
                  } }
                  disabled={ isFirstRow }
                >
                  <Icon icon="arrow-up" />
                </Button>
                <Button
                  block
                  outline color="muted"
                  className="mt-2"
                  onClick={ () => {
                    const o = openItem
                    setOpenItem(undefined)
                    gridDispatch(
                      'moveRow',
                      { from: rowIndex, to: rowIndex + 1 }
                    )
                    setOpenItem(o + 1)
                  } }
                  disabled={ isLastRow }
                >
                  <Icon icon="arrow-down" />
                </Button>
              </Collapse>
            }
          </>
      }
    </ItemContext.Consumer>
  </td>

LeftColumn.contextTypes = {
  gridDispatch: PropTypes.func,
}

export const RightColumn = (
  { rowIndex, rowData: [{ type }], onClickOptions },
  { gridDispatch }
) =>
  <td>
    <ItemContext.Consumer>
      {
        ({ openItem, setOpenItem }) =>
          <>
            {
              type !== 'divider'
                ? <Button
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
                : null
            }
            {
              <Collapse isOpen={ type === 'divider' || openItem === rowIndex }>
                <Button block
                  outline color="muted"
                  className={ type !== 'divider' ? 'mt-2' : '' }
                  onClick={ () => gridDispatch('deleteRow', rowIndex) }
                >
                  <Icon icon="trash" />
                </Button>
              </Collapse>
            }
          </>
      }
    </ItemContext.Consumer>
  </td>

RightColumn.contextTypes = {
  gridDispatch: PropTypes.func,
}
