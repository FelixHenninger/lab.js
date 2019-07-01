import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { Control, actions } from 'react-redux-form'
import { Row, Col, Input,
  InputGroup, InputGroupAddon, InputGroupText, InputGroupButtonDropdown,
  DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

import Icon from '../../../../../../../Icon'

const CodingPair = (
  { icon, iconFallbackWeight='r', model, index, itemModel, totalPairs },
  { formDispatch }
) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <Icon
            icon={ icon } fixedWidth
            fallbackWeight={ iconFallbackWeight }
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
        <DropdownToggle
          outline caret split
          color="secondary" className="rounded-right"
        />
        <DropdownMenu right>
          <DropdownItem header>
            Add and delete
          </DropdownItem>
          <DropdownItem
            onClick={ () => formDispatch(
              actions.change(
                `local.items${ itemModel }${ model }`,
                items => [
                  ...items.slice(0, index + 1),
                  {},
                  ...items.slice(index + 1, items.length)
                ]
              )
            ) }
          >
            Add below
          </DropdownItem>
          <DropdownItem
            onClick={ () => formDispatch(
              actions.remove(
                `local.items${ itemModel }${ model }`,
                index
              )
            ) }
          >
            Delete
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>
            Move
          </DropdownItem>
          <DropdownItem
            onClick={ () => formDispatch(
              actions.move(
                `local.items${ itemModel }${ model }`,
                index, index - 1
              )
            ) }
            disabled={ index === 0 }
          >
            Up
          </DropdownItem>
          <DropdownItem
            onClick={ () => formDispatch(
              actions.move(
                `local.items${ itemModel }${ model }`,
                index, index + 1
              )
            ) }
            disabled={ index >= totalPairs - 1 }
          >
            Down
          </DropdownItem>
        </DropdownMenu>
      </InputGroupButtonDropdown>
    </InputGroup>
  )
}

CodingPair.contextTypes = {
  formDispatch: PropTypes.func,
}

export const CodingGroup = ({
  data=[], model, itemModel,
  icon, iconFallbackWeight
}) =>
  // TODO: Simplify form field coordination. Splitting the path
  // into model, itemmodel and index seems overly complicated
  // (the full path still needs to be reconstructed at some point,
  // because the action creator above needs access to it -- sadly,
  // the fieldset doesn't help here.)
  // ----
  // Also, think about moving the manipulation logic out of the
  // individual pairs, and up to a higher level such as this one.
  <div className="pt-1">
    {
      [...data, {}].map((x, i) =>
        <Row form key={ `coding-${ model }-${ i }` }>
          <Col className="pt-1">
            <CodingPair
              icon={ icon }
              iconFallbackWeight={ iconFallbackWeight }
              model={ `${ model }` }
              itemModel={ itemModel }
              index={ i }
              totalPairs={ data.length }
            />
          </Col>
        </Row>
      )
    }
  </div>
