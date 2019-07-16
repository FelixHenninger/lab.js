import React, { useState } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Row, Col
} from 'reactstrap'

import Icon from '../../../../../Icon'

const Item = ({ data=undefined, children }, { gridDispatch }) =>
  <DropdownItem
    onClick={ () => gridDispatch('addRows', [[ { required: true, ...data } ]]) }
    disabled={ data === undefined }
  >
    { children }
  </DropdownItem>

Item.contextTypes = {
  gridDispatch: PropTypes.func,
}

const AddWidget = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <ButtonDropdown
      direction="down"
      isOpen={ dropdownOpen }
      toggle={ () => setDropdownOpen(!dropdownOpen) }
      className="w-100"
    >
      <DropdownToggle
        outline color="muted" size="sm"
        className="hover-target"
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
            <Item data={{ type: 'text' }}>
              Text <span className="text-muted">/ Instructions</span>
            </Item>
            <Item>
              Image
            </Item>
            <Item data={{ type: 'divider' }}>
              Divider
            </Item>
            <DropdownItem divider />
            <DropdownItem header>
              Advanced
            </DropdownItem>
            <Item data={{ type: 'html' }}>
              Raw <code className="text-body">HTML</code>
            </Item>
          </Col>
          <Col className="border-right pt-2 pb-3">
            <DropdownItem header>
              Free-form input
            </DropdownItem>
            <Item data={{ type: 'input' }}>
              Single-line
            </Item>
            <Item data={{ type: 'textarea' }}>
              Multi-line
            </Item>
            <DropdownItem divider />
            <DropdownItem header>
              Structured input
            </DropdownItem>
            <Item data={{ type: 'radio', options: [] }}>
              Multiple choice
            </Item>
            <Item data={{ type: 'checkbox', options: [] }}>
              Check all that apply
            </Item>
          </Col>
          <Col className="pt-2 pb-3">
            <DropdownItem header>
              Ranges
            </DropdownItem>
            <Item data={{ type: 'slider' }}>
              Slider
            </Item>
            <Item>
              Visual analogue scale
            </Item>
            <Item data={{ type: 'likert', items: [], width: 5, anchors: [] }}>
              Likert scale
            </Item>
          </Col>
        </Row>
      </DropdownMenu>
    </ButtonDropdown>
  )
}

export default ({ columns }) =>
  <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <AddWidget />
      </td>
      <td />
    </tr>
  </tfoot>
