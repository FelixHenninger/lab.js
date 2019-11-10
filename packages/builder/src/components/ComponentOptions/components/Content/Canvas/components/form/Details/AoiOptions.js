import React from 'react'
import PropTypes from 'prop-types'

import { DropdownMenu, DropdownItem, Input,
  InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'
import { Control } from 'react-redux-form'

import Icon from '../../../../../../../Icon'

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
        <Control
          model=".label"
          component={ Input }
          placeholder="Label"
          debounce={ 200 }
          className="form-control"
          style={{ fontFamily: 'Fira Mono' }}
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
