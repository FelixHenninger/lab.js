import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { Control, actions } from 'react-redux-form'
import { Row, Col, Input,
  InputGroup, InputGroupAddon, InputGroupText, InputGroupButtonDropdown,
  DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

import Icon from '../../../../../../../Icon'
import { ItemContext } from '../../../index'

const CodingPair = ({ icon, model, index, itemModel }, { formDispatch }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <Icon
            icon={ icon } fixedWidth
            fallbackWeight="r"
            className="text-muted"
          />
        </InputGroupText>
      </InputGroupAddon>
      <Control
        model={ `${ model }[${ index }].label` }
        placeholder="label"
        component={ Input }
        debounce={ 300 }
      />
      <Control
        model={ `${ model }[${ index }].coding` }
        placeholder="coding"
        component={ Input }
        controlProps={{
          style: {
            fontFamily: 'Fira Mono',
          }
        }}
        debounce={ 300 }
      />
      <InputGroupButtonDropdown
        addonType="append"
        isOpen={ dropdownOpen }
        toggle={ () => setDropdownOpen(!dropdownOpen) }
      >
        {/* For some reason, the rounded corners need to be set explicitly */}
        <DropdownToggle outline color="secondary" className="rounded-right">
          <Icon icon="caret-down" className="text-muted" />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem
            onClick={ () => formDispatch(
              actions.remove(
                `local.questions${ itemModel }${ model }`,
                index
              )
            ) }
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </InputGroupButtonDropdown>
    </InputGroup>
  )
}

CodingPair.contextTypes = {
  formDispatch: PropTypes.func,
}

export const CodingGroup = ({ data=[], model, icon }) =>
  <div className="pt-1">
    <ItemContext.Consumer>
    { itemModel => (
      [...data, {}].map((x, i) =>
        <Row form key={ `coding-${ model }-${ i }` }>
          <Col className="pt-1">
            <CodingPair
              icon={ icon }
              model={ `${ model }` }
              index={ i }
              itemModel={ itemModel }
            />
          </Col>
        </Row>
      )
    )}

    </ItemContext.Consumer>
  </div>
