import React, { useContext } from 'react'

import { Button, Collapse } from 'reactstrap'
import Icon from '../../../../../Icon'

import { ItemContext } from '../index'
import { useFormikContext, getIn } from 'formik'

const icons = {
  'text': 'info',
  'image': 'image',
  'divider': 'horizontal-rule', // could be page-break
  'html': 'code',
  'input': 'comment-alt-minus',
  'textarea': 'comment-alt-lines',
  'radio': 'list-ul',
  'checkbox': 'tasks',
  'slider': 'sliders-h',
  'likert': 'grip-horizontal',
}

export const LeftColumn = ({ name, index, arrayHelpers, isLastItem }) => {
  const { openItem, setOpenItem } = useContext(ItemContext)
  const { values } = useFormikContext()
  const type = getIn(values, `${ name }.type`)

  return (
    <td>
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
      <Collapse isOpen={ openItem === index && type !== 'divider' }>
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
            arrayHelpers.swap(index, index - 1)
            setOpenItem(o - 1)
          } }
          disabled={ index === 0 }
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
            arrayHelpers.swap(index, index + 1)
            setOpenItem(o + 1)
          } }
          disabled={ isLastItem }
        >
          <Icon icon="arrow-down" />
        </Button>
      </Collapse>
    </td>
  )
}

export const RightColumn = ({ name, index, arrayHelpers }) => {
  const { openItem, setOpenItem } = useContext(ItemContext)
  const { values } = useFormikContext()
  const type = getIn(values, `${ name }.type`)

  return (
    <td>
      {
        type !== 'divider'
          ? <Button
              block outline color="muted"
              onClick={ () => {
                // TODO: Think about moving logic into the ItemContext
                if (openItem === index) {
                  setOpenItem(undefined)
                } else {
                  setOpenItem(index)
                }
              } }
            >
              <Icon icon="cog" />
            </Button>
          : null
      }
      <Collapse isOpen={ type === 'divider' || openItem === index }>
        <Button block
          outline color="muted"
          className={ type !== 'divider' ? 'mt-2' : '' }
          onClick={ () => arrayHelpers.remove(index) }
        >
          <Icon icon="trash" />
        </Button>
      </Collapse>
    </td>
  )
}
