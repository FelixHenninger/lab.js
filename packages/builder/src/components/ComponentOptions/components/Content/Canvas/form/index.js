import React, { Component } from 'react'

import { Control } from 'react-redux-form'
import { DropdownToggle, DropdownMenu, DropdownItem,
  Button, ButtonGroup,
  InputGroup, InputGroupButton, InputGroupAddon } from 'reactstrap'
import DropDown from '../../../../../Dropdown'

import './index.css'

const toNumber = x => {
  if (x === '-') {
    return undefined
  } else {
    return Number(x)
  }
}

export const AddDropDown = ({ addHandler, cloneHandler, removeHandler }) =>
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
      onClick={ cloneHandler }
    >
      <i className="fa fa-clone" />
    </Button>
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

const Swatch = ({ color, clickHandler }) => {
  return <div
    className="color-swatch"
    onClick={ () => clickHandler(color) }
    style={{
      backgroundColor: color,
      border: `1px solid ${ color === '#ffffff' ? '#ccc' : color }`,
    }}
  />
}

const Line = ({ height }) =>
  <div className="w-100" style={{ backgroundColor: 'black', height: height }} />

const StrokeWidthDropdown = ({ onChange }) =>
  <InputGroupButton>
    <DropDown
      type="button"
      dropup
    >
      <DropdownToggle caret>
        <i
          className={ `fa fa-paint-brush` }
        />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem
          onClick={ () => onChange(0) }
        >
          No line
        </DropdownItem>
        <DropdownItem divider />
        {
          [2, 5, 10].map(width =>
            <DropdownItem
              key={ `strokeWidthDropDown-${ width }` }
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
              onClick={ () => onChange(width) }
            >
              <Line height={ `${ width }px` } />
            </DropdownItem>
          )

        }
      </DropdownMenu>
    </DropDown>
  </InputGroupButton>

class ColorDropdown extends Component {
  select(color, toggle=true) {
    if (toggle) {
      this.dropdown.toggle()
    }

    this.manualColor.value = color
    this.props.onChange(color)
  }

  render() {
    const colors = [
      '#0d3b83', '#0070d9', // blues
      '#12864e', '#a8ca09', // greens
      '#d6341a', '#fcbb0a', // red / yellow
    ]

    const grays = [
      '#ffffff', '#dddddd',
      '#aaaaaa', '#111111',
    ]

    return <DropDown
        dropup
        type="button"
        ref={ ref => this.dropdown = ref }
      >
        <input type="color"
          ref={ ref => this.hiddenColor = ref }
          /* For some weird reason, display: none won't work here */
          style={{ visibility: 'hidden', position: 'absolute' }}
          tabIndex={ -1 }
          onChange={ () => this.select(this.hiddenColor.value, false) }
        />
        <DropdownToggle caret>
          <i
            className={ `fa fa-${ this.props.icon }` }
            style={{ position: 'relative', top: '1px' }}
          />
        </DropdownToggle>
        <DropdownMenu right className="color-dropdown">
          <div
            className="dropdown-item"
            style={{ height: '136px' }}
          >
            {
              colors.map(c =>
                <Swatch
                  key={ c } color={ c }
                  clickHandler={ c => this.select(c) }
                />
              )
            }
          </div>
          <DropdownItem divider />
          <div
            className="dropdown-item"
            style={{ height: '90px' }}
          >
            {
              grays.map(c =>
                <Swatch
                  key={ c } color={ c }
                  clickHandler={ c => this.select(c) }
                />
              )
            }
          </div>
          <DropdownItem divider />
          <div className="dropdown-item">
            <a
              className="btn btn-secondary"
              style={{ width: '126px' }}
              onClick={ () => {
                this.hiddenColor.focus()
                this.hiddenColor.select()
                this.hiddenColor.click()
                this.dropdown.toggle()
              } }
            >
              <i className="fa fa-eyedropper" />
            </a>
            {/*

            */}
          </div>
          <DropdownItem divider />
          <div className="dropdown-item">
            <input
              className="form-control w-100"
              style={{ fontFamily: 'Fira Mono' }}
              placeholder="CSS color"
              ref={ ref => this.manualColor = ref }
              onChange={ () => this.select(this.manualColor.value, false) }
            />
          </div>
        </DropdownMenu>
      </DropDown>
  }
}

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
      style={{ fontFamily: 'Fira Mono' }}
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
      style={{ fontFamily: 'Fira Mono' }}
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
      style={{ fontFamily: 'Fira Mono' }}
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
      style={{ fontFamily: 'Fira Mono' }}
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
      style={{ fontFamily: 'Fira Mono' }}
    />
    <Control
      model=".strokeWidth"
      component={ StrokeWidthDropdown }
    />
    <Control
      model=".stroke"
      component={ ColorDropdown }
      controlProps={{
        icon: 'square-o'
      }}
    />
    <Control
      model=".fill"
      component={ ColorDropdown }
      controlProps={{
        icon: 'square'
      }}
    />
</InputGroup>
