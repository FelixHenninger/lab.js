import React, { Component } from 'react'

import { Control } from 'react-redux-form'
import { DropdownToggle, DropdownMenu, DropdownItem,
  Button, ButtonGroup,
  InputGroup, InputGroupAddon } from 'reactstrap'
import DropDown from '../../../../../Dropdown'

import './index.css'

export const AddDropDown = ({ addHandler, cloneHandler, removeHandler }) =>
  <ButtonGroup>
    <DropDown type="button" dropup>
      <DropdownToggle outline color="secondary">
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
        <DropdownItem divider />
        <DropdownItem header>From selected</DropdownItem>
        <DropdownItem
          onClick={ cloneHandler }
        >
          Duplicate
        </DropdownItem>
      </DropdownMenu>
    </DropDown>
    <Button
      outline color="secondary"
      onClick={ removeHandler }
    >
      <i className="fa fa-trash-o" />
    </Button>
  </ButtonGroup>

export const Layers = ({ upHandler, downHandler }) =>
  <ButtonGroup
    className="ml-2"
  >
    <Button outline color="secondary" onClick={ upHandler }>
      <i className="fa fa-arrow-up" />
    </Button>
    <Button outline color="secondary" onClick={ downHandler }>
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
  <div
    className="w-100"
    style={{
      backgroundColor: 'black',
      height: height
    }}
  />

const StrokeWidthDropdown = ({ onChange, disabled }) =>
  <DropDown
    type="button"
    dropup
  >
    <DropdownToggle caret outline color="secondary" disabled={ disabled }>
      <i
        className="fa fa-paint-brush"
        style={{
          fontSize: '0.9em',
        }}
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

class ColorDropdown extends Component {
  select(color, toggle=true) {
    if (toggle) {
      this.dropdown.toggle()
    }

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
      '#aaaaaa', '#000000',
    ]

    return <DropDown
        dropup
        type="button"
        ref={ ref => this.dropdown = ref }
      >
        {/* Hidden color input used to capture freely chosen colors */}
        <input type="color"
          /* For some weird reason, display: none won't work here */
          style={{ visibility: 'hidden', position: 'absolute' }}
          tabIndex={ -1 }
          ref={ ref => this.hiddenColor = ref }
          value={ this.props.value || '' }
          onChange={ () => this.select(this.hiddenColor.value, false) }
        />
        {/* Remainder of the Dropdown */}
        <DropdownToggle
          caret outline color="secondary"
          disabled={ this.props.disabled }
        >
          <i
            className={ `fa fa-${ this.props.icon }` }
            style={{ position: 'relative', top: '1px' }}
          />
        </DropdownToggle>
        <DropdownMenu right className="color-dropdown">
          {/* Predefined colors */}
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
          {/* Grey values */}
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
          {/* Custom color selector */}
          <div className="dropdown-item">
            <a
              className="btn btn-outline-secondary"
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
          </div>
          <DropdownItem divider />
          {/* Manual (text-based) color input */}
          <div className="dropdown-item">
            <input
              className="form-control w-100"
              style={{ fontFamily: 'Fira Mono' }}
              placeholder="CSS color"
              ref={ ref => this.manualColor = ref }
              value={ this.props.value || '' }
              onChange={ () => this.select(this.manualColor.value, false) }
            />
          </div>
        </DropdownMenu>
      </DropDown>
  }
}

export const Typography = ({ selection, changeHandler }) =>
  <DropDown
    dropup
    type="button"
  >
    <DropdownToggle
      caret outline color="secondary"
      disabled={ selection.type !== 'i-text' }
    >
      <i className="fa fa-font" />
    </DropdownToggle>
    {
      selection.type === 'i-text'
        ? <DropdownMenu
            style={{
              width: '200px',
            }}
          >
            {/* <divs> are needed here because DropdownItems are buttons,
                and the buttons here can't be nested within. */}
            <div className="dropdown-item">
              <Control.select
                model=".fontFamily"
                className="form-control custom-select"
              >
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
                <option value="monospace">Monospace</option>
              </Control.select>
            </div>
            <div className="dropdown-item">
              <ButtonGroup className="w-100">
                <Button
                  outline color={
                    selection.fontStyle === 'italic'
                      ? 'primary'
                      : 'secondary'
                  }
                  className="w-50"
                  onClick={ () => {
                    if (selection.fontStyle === 'italic') {
                      changeHandler('fontStyle', 'normal')
                    } else {
                      changeHandler('fontStyle', 'italic')
                    }
                  } }
                >
                  <i className="fa fa-italic" />
                </Button>
                <Button
                  outline color={
                    selection.fontWeight === 'bold'
                      ? 'primary'
                      : 'secondary'
                  }
                  className="w-50"
                  onClick={ () => {
                    if (selection.fontWeight === 'bold') {
                      changeHandler('fontWeight', 'normal')
                    } else {
                      changeHandler('fontWeight', 'bold')
                    }
                  } }
                >
                  <i className="fa fa-bold" />
                </Button>
              </ButtonGroup>
            </div>
            <DropdownItem divider />
            <div className="dropdown-item">
              <InputGroup>
                <InputGroupAddon>
                  <i className="fa fa-text-height" />
                </InputGroupAddon>
                <Control
                  model=".fontSize"
                  placeholder="Size"
                  debounce={ 200 }
                  className="form-control"
                  style={{ fontFamily: 'Fira Mono' }}
                />
              </InputGroup>
            </div>
            <DropdownItem divider />
            <div className="dropdown-item">
              <ButtonGroup>
              {
                ['left', 'center', 'right'].map(alignment =>
                  <Button
                    key={ `text-align-${ alignment }` }
                    outline color={ selection.textAlign === alignment
                      ? 'primary'
                      : 'secondary'
                    }
                    onClick={ () => changeHandler({
                      textAlign: alignment,
                      originX: alignment,
                    }) }
                  >
                    <i className={ `fa fa-align-${ alignment }` } />
                  </Button>
                )
              }
              </ButtonGroup>
            </div>
          </DropdownMenu>
        : null
    }
  </DropDown>

export const Dimensions = ({ type }) =>
  <InputGroup className="dimension-toolbar minimal-width-addons ml-2">
    <InputGroupAddon>
      <i className="fa fa-long-arrow-right" />
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
    <InputGroupAddon>
      <i className="fa fa-long-arrow-down" />
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
    <InputGroupAddon>
      <i className="fa fa-rotate-right" />
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
    <InputGroupAddon>
      <i className="fa fa-arrows-h" />
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
    <InputGroupAddon>
      <i className="fa fa-arrows-v" />
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

export const Style = ({ selection, changeHandler }) =>
  <ButtonGroup className="ml-2">
    <Typography
      selection={ selection }
      changeHandler={ changeHandler }
    />
    <Control
      model=".strokeWidth"
      component={ StrokeWidthDropdown }
      controlProps={{
        disabled: selection.type === undefined,
      }}
    />
    <Control
      model=".stroke"
      component={ ColorDropdown }
      controlProps={{
        icon: 'square-o',
        disabled: selection.type === undefined,
      }}
    />
    <Control
      model=".fill"
      component={ ColorDropdown }
      controlProps={{
        icon: 'square',
        disabled: ['line', undefined].includes(selection.type),
      }}
    />
  </ButtonGroup>
