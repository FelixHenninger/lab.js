import React from 'react'
import PropTypes from 'prop-types'

import { DropdownMenu, DropdownItem,
  InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'
import { Field } from 'formik'

import Icon from '../../../../../../../Icon'
import { Input } from '../../../../../../../Form'

const AoiOptions = () =>
  <DropdownMenu right
    style={{
      width: '300px',
    }}
  >
    <DropdownItem tag="div" toggle={ false } className="mute">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <Icon fixedWidth icon="tag" />
          </InputGroupText>
        </InputGroupAddon>
        <Field
          name="label"
          component={ Input }
          placeholder="Label"
          className="text-monospace"
        />
      </InputGroup>
    </DropdownItem>
  </DropdownMenu>

AoiOptions.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default AoiOptions
