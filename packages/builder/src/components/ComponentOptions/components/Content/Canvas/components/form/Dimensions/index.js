import React from 'react'

import { InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'
import { Control } from 'react-redux-form'

import Icon from '../../../../../../../Icon'

import './index.css'

export default ({ type }) =>
  <InputGroup className="dimension-toolbar minimal-width-addons ml-2">
    <InputGroupAddon addonType="prepend">
      <span className="input-group-text">
        <Icon icon="long-arrow-right" fixedWidth />
      </span>
    </InputGroupAddon>
    <Control
      model=".left"
      defaultValue=""
      placeholder="x"
      disabled={ type === undefined }
      debounce={ 200 }
      className="form-control"
      style={{ fontFamily: 'Fira Mono' }}
    />
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <Icon icon="long-arrow-down" fixedWidth />
      </InputGroupText>
    </InputGroupAddon>
    <Control
      model=".top"
      defaultValue=""
      placeholder="y"
      disabled={ type === undefined }
      debounce={ 200 }
      className="form-control"
      style={{ fontFamily: 'Fira Mono' }}
    />
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <Icon icon="redo" fixedWidth />
      </InputGroupText>
    </InputGroupAddon>
    <Control
      model=".angle"
      defaultValue=""
      placeholder="angle"
      disabled={ ['circle', 'i-text', undefined].includes(type) }
      debounce={ 200 }
      className="form-control"
      style={{ fontFamily: 'Fira Mono' }}
    />
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <Icon icon="arrows-h" fixedWidth />
      </InputGroupText>
    </InputGroupAddon>
    <Control
      model=".width"
      defaultValue=""
      placeholder="width"
      disabled={ ['i-text', undefined].includes(type) }
      debounce={ 200 }
      className="form-control"
      style={{ fontFamily: 'Fira Mono' }}
    />
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <Icon icon="arrows-v" fixedWidth />
      </InputGroupText>
    </InputGroupAddon>
    <Control
      model=".height"
      defaultValue=""
      placeholder="height"
      disabled={ ['line', 'circle', 'i-text', undefined].includes(type) }
      debounce={ 200 }
      className="form-control"
      style={{ fontFamily: 'Fira Mono' }}
    />
  </InputGroup>
