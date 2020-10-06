import React, { useState } from 'react'

import { FastField, FieldArray, useFormikContext, getIn } from 'formik'
import { Row, Col,
  InputGroup, InputGroupAddon, InputGroupText, InputGroupButtonDropdown,
  DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

import Icon from '../../../../../../../Icon'
import { Input } from '../../../../../../../Form'

const CodingPair = ({
  name, index, arrayHelpers,
  icon, iconFallbackWeight='r', totalPairs
}) => {
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
      <FastField
        name={ `${ name }[${ index }].label` }
        placeholder="label"
        component={ Input }
      />
      <FastField
        name={ `${ name }[${ index }].coding` }
        placeholder="coding"
        component={ Input }
        className="text-monospace"
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
            onClick={ () => arrayHelpers.insert(index + 1, {}) }
          >
            Add below
          </DropdownItem>
          <DropdownItem
            onClick={ () => arrayHelpers.remove(index) }
          >
            Delete
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>
            Move
          </DropdownItem>
          <DropdownItem
            onClick={ () => arrayHelpers.swap(index, index - 1) }
            disabled={ index === 0 }
          >
            Up
          </DropdownItem>
          <DropdownItem
            onClick={ () => arrayHelpers.swap(index, index + 1) }
            disabled={ index >= totalPairs - 1 }
          >
            Down
          </DropdownItem>
        </DropdownMenu>
      </InputGroupButtonDropdown>
    </InputGroup>
  )
}

export const CodingGroup = ({ name, icon, iconFallbackWeight }) => {
  const { values } = useFormikContext()
  const data = getIn(values, name) ?? []

  // TODO: Think about moving the manipulation logic out of the
  // individual pairs, and up to a higher level such as this one.
  return (
    <div className="pt-1">
      <FieldArray
        name={ name }
        render={ arrayHelpers =>
          [...data, {}].map((x, i) => (
            <Row form key={ `coding-${ name }-${ i }` }>
              <Col className="pt-1">
                <CodingPair
                  name={ `${ name }` }
                  index={ i }
                  arrayHelpers={ arrayHelpers }
                  icon={ icon }
                  iconFallbackWeight={ iconFallbackWeight }
                  totalPairs={ data.length }
                />
              </Col>
            </Row>
          )  )
        }
      />
    </div>
  )
}
