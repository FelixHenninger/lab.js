import React, { useState } from 'react'

import {
  ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Row, Col
} from 'reactstrap'

import Icon from '../../../../../Icon'

const Item = ({ onClick, disabled, children }) =>
  <DropdownItem
    onClick={ onClick }
    disabled={ disabled }
  >
    { children }
  </DropdownItem>

const AddWidget = ({ addItem: defaultAddItem }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const addItem = (data) => defaultAddItem({ required: true, ...data })

  return (
    <ButtonDropdown
      direction="down"
      isOpen={ dropdownOpen }
      toggle={ () => setDropdownOpen(!dropdownOpen) }
      className="w-100"
    >
      <DropdownToggle
        outline color="muted" size="sm"
        // TODO: The rounded class shouldn't be needed,
        // but bootstrap's dropdown-toggle class isn't
        // very helpful either, adding a second caret.
        className="hover-target rounded"
      >
        <Icon icon="plus" fixedWidth />
        <Icon
          icon="caret-down"
          className="float-right"
          weight="s"
          style={{ position: 'relative', top: '3px' }}
        />
      </DropdownToggle>
      <DropdownMenu
        className="p-0 w-100"
      >
        <Row noGutters>
          <Col className="border-right pt-2 pb-3">
            <DropdownItem header>
              Content
            </DropdownItem>
            <Item onClick={ () => addItem({ type: 'text' }) }>
              Text <span className="text-muted">/ Instructions</span>
            </Item>
            <Item onClick={ () => addItem({ type: 'image' }) }>
              Image
            </Item>
            <Item onClick={ () => addItem({ type: 'divider' }) }>
              Divider
            </Item>
            <DropdownItem divider />
            <DropdownItem header>
              Advanced
            </DropdownItem>
            <Item onClick={ () => addItem({ type: 'html' }) }>
              Raw <code className="text-body">HTML</code>
            </Item>
          </Col>
          <Col className="border-right pt-2 pb-3">
            <DropdownItem header>
              Free-form input
            </DropdownItem>
            <Item onClick={ () => addItem({ type: 'input' }) }>
              Single-line
            </Item>
            <Item onClick={ () => addItem({ type: 'textarea' }) }>
              Multi-line
            </Item>
            <DropdownItem divider />
            <DropdownItem header>
              Structured input
            </DropdownItem>
            <Item onClick={ () => addItem({ type: 'radio' }) }>
              Multiple choice
            </Item>
            <Item onClick={ () => addItem({ type: 'checkbox' }) }>
              Check all that apply
            </Item>
          </Col>
          <Col className="pt-2 pb-3">
            <DropdownItem header>
              Ranges
            </DropdownItem>
            <Item onClick={ () => addItem({ type: 'slider' }) }>
              Slider
            </Item>
            <Item disabled={ true }>
              Visual analogue scale
            </Item>
            <Item
              onClick={ () => addItem({
                type: 'likert',
                items: [],
                width: 5,
                anchors: [],
              }) }
            >
              Likert scale
            </Item>
          </Col>
        </Row>
      </DropdownMenu>
    </ButtonDropdown>
  )
}

export default ({ columns, addItem }) =>
  <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <AddWidget addItem={ addItem } />
      </td>
      <td />
    </tr>
  </tfoot>
