import React from 'react'

import { DropdownMenu,
  InputGroup, InputGroupAddon, InputGroupText, Input } from 'reactstrap'
import { Control } from 'react-redux-form'

import Icon from '../../../../../../../Icon'

export default () =>
  <DropdownMenu right
    style={{
      width: '500px',
    }}
  >
    <div className="dropdown-item">
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
    </div>
  </DropdownMenu>
