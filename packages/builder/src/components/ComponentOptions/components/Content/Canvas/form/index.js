import React from 'react'

import { Control } from 'react-redux-form'
import { DropdownToggle, DropdownMenu, DropdownItem,
  Button, ButtonGroup, InputGroup, InputGroupAddon } from 'reactstrap'
import DropDown from '../../../../../Dropdown'

import './index.css'

const toNumber = x => {
  if (x === '-') {
    return undefined
  } else {
    return Number(x)
  }
}

export const AddDropDown = ({ addHandler, removeHandler }) =>
  <ButtonGroup>
    <DropDown type="button" dropup>
      <DropdownToggle>
        <i
          className="fa fa-plus"
          style={{
            position: 'relative',
            top: '0.5px'
          }}
        />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Shapes</DropdownItem>
        <DropdownItem
          onClick={ () => addHandler('line') }
        >
          Line
        </DropdownItem>
        <DropdownItem
          onClick={ () => addHandler('circle') }
        >
          Circle
        </DropdownItem>
        <DropdownItem
          onClick={ () => addHandler('ellipse') }
        >
          Ellipse
        </DropdownItem>
        <DropdownItem
          onClick={ () => addHandler('triangle') }
        >
          Triangle
        </DropdownItem>
        <DropdownItem
          onClick={ () => addHandler('rect') }
        >
          Rectangle
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem header>Text</DropdownItem>
        <DropdownItem
          onClick={ () => addHandler('text', { content: 'text' }) }
        >
          Text
        </DropdownItem>
      </DropdownMenu>
    </DropDown>
    <Button
      onClick={ removeHandler }
    >
      <i className="fa fa-trash" />
    </Button>
  </ButtonGroup>

export const Layers = ({ upHandler, downHandler, className }) =>
  <ButtonGroup
    className={ className }
  >
    <Button onClick={ upHandler }>
      <i className="fa fa-arrow-up" />
    </Button>
    <Button onClick={ downHandler}>
      <i className="fa fa-arrow-down" />
    </Button>
  </ButtonGroup>

export const Dimensions = ({ type }) =>
  <InputGroup className="minimal-width-addons">
    <InputGroupAddon>
      <i className="fa fa-long-arrow-right" />
    </InputGroupAddon>
    <Control
      model=".left"
      placeholder="x"
      parser={ toNumber }
      debounce={ 200 }
      className="form-control"
    />
    <InputGroupAddon>
      <i className="fa fa-long-arrow-down" />
    </InputGroupAddon>
    <Control
      model=".top"
      placeholder="y"
      parser={ toNumber }
      debounce={ 200 }
      className="form-control"
    />
    <InputGroupAddon>
      <i className="fa fa-rotate-right" />
    </InputGroupAddon>
    <Control
      model=".angle"
      placeholder="angle"
      disabled={ ['circle', 'i-text'].includes(type) }
      parser={ toNumber }
      debounce={ 200 }
      className="form-control"
    />
    <InputGroupAddon>
      <i className="fa fa-arrows-h" />
    </InputGroupAddon>
    <Control
      model=".width"
      placeholder="width"
      disabled={ ['i-text'].includes(type) }
      parser={ toNumber }
      debounce={ 200 }
      className="form-control"
    />
    <InputGroupAddon>
      <i className="fa fa-arrows-v" />
    </InputGroupAddon>
    <Control
      model=".height"
      placeholder="height"
      disabled={ ['circle', 'i-text'].includes(type) }
      parser={ toNumber }
      debounce={ 200 }
      className="form-control"
    />
    <InputGroupAddon>
      <i className="fa fa-square" />
    </InputGroupAddon>
    <Control
      model=".fill"
      placeholder="fill"
      type="color"
      className="form-control"
      style={{
        height: '38px',
      }}
    />
  </InputGroup>
