import React from 'react'

import { DropdownMenu, DropdownItem,
  InputGroup, InputGroupAddon, InputGroupText, Input } from 'reactstrap'
import { Control } from 'react-redux-form'

import Icon from '../../../../../../../Icon'

export default () =>
  <DropdownMenu right
    style={{
      width: '500px',
    }}
  >
    <DropdownItem tag="div" toggle={ false } className="mute">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <Icon icon="file-image" />
          </InputGroupText>
        </InputGroupAddon>
        <Control
          model=".src"
          component={ Input }
          placeholder="Source"
          debounce={ 200 }
          className="form-control"
          style={{ fontFamily: 'Fira Mono' }}
        />
      </InputGroup>
    </DropdownItem>
  </DropdownMenu>
