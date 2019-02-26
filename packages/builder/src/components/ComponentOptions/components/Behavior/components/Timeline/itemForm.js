import React, { createRef } from 'react'
import PropTypes from 'prop-types'

import { CardBody } from 'reactstrap'
import { Fieldset, Control } from 'react-redux-form'
import { Button, ButtonGroup,
  UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  InputGroup, InputGroupAddon, InputGroupText, Input, FormGroup,
  Row, Col, Alert } from 'reactstrap'
import { capitalize } from 'lodash'

import Icon from '../../../../../Icon'
import FileSelector from '../../../../../FileSelector'

const toFloat = x => parseFloat(x) || 0

const Toolbar = ({ add, duplicateCurrent, deleteCurrent }) =>
  <div className="float-right">
    <ButtonGroup>
      <UncontrolledButtonDropdown direction="up">
        <DropdownToggle outline color="secondary">
          <Icon
            icon="plus" fixedWidth
            style={{
              position: 'relative',
              top: '0.5px'
            }}
          />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem header>Audio</DropdownItem>
          <DropdownItem
            onClick={ () => add({ type: 'sound' }) }
          >
            Sound file
          </DropdownItem>
          <DropdownItem
            onClick={ () => add({ type: 'oscillator' }) }
          >
            Oscillator
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>From selected</DropdownItem>
          <DropdownItem
            onClick={ () => duplicateCurrent() }
          >
            Duplicate
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
      <Button
        outline color="secondary"
        onClick={ deleteCurrent }
      >
        <Icon
          icon="trash" fixedWidth
          style={{
            position: 'relative',
            top: '0.5px'
          }}
         />
      </Button>
    </ButtonGroup>
  </div>

const InteractionWarning = (_, { id, store }) => {
  // Check whether the current component is the first in the study
  // TODO: Add a more sophisticated check,
  // taking into account nested flow components
  if (store.getState().components['root'].children[0] === id) {
    return (
      <Alert color="warning">
        <h3 className="h6 mt-2">
          Adding audio to the first component in a study
        </h3>
        Many browsers don't allow a website to play media until a user has interacted with the page. To make sure that you participants can hear the sounds you're adding, please ask for user input on your study's first screen.
      </Alert>
    )
  } else {
    return null
  }
}

InteractionWarning.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  store: PropTypes.object,
}

const Header = ({ activeItem, add, duplicateCurrent, deleteCurrent }) => {
  return <div>
    <Row form className="clearfix">
      <Col>
        <Toolbar
          add={ add }
          duplicateCurrent={ duplicateCurrent }
          deleteCurrent={ deleteCurrent }
        />
        {
          activeItem
            ? <h3 className="h5 mt-2">
                { capitalize(activeItem.type) }
              </h3>
            : <div className="text-muted text-center">
                <small>Please add or select a timeline item</small>
              </div>
        }
      </Col>
    </Row>
    {
      activeItem
        ? <Row>
            <Col>
              <hr />
              <InteractionWarning />
            </Col>
          </Row>
        : null
    }
  </div>
}

const SettingGroup = ({
  model, parser, children,
  icon, fallbackIcon, placeholder, unit
}) =>
  <FormGroup>
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <Icon fixedWidth icon={ icon } fallback={ fallbackIcon } />
        </InputGroupText>
      </InputGroupAddon>
      {
        children
          ? children
          : <Control
              model={ model }
              parser={ parser }
              component={ Input }
              placeholder={ placeholder }
              debounce={ 200 }
              className="form-control"
              style={{ fontFamily: 'Fira Mono' }}
            />
      }
      {
        unit
          ? <InputGroupAddon addonType="append">
              <InputGroupText
                className="text-right"
                style={{ minWidth: '3rem' }}
              >
                { unit }
              </InputGroupText>
            </InputGroupAddon>
          : null
      }
    </InputGroup>
  </FormGroup>

const TimingRow = () =>
  <Row form>
    <Col>
      <SettingGroup
        model=".start" parser={ toFloat }
        icon="arrow-from-left" fallbackIcon="play-circle"
        placeholder="start" unit="ms"
      />
    </Col>
    <Col>
      <SettingGroup
        model=".stop" parser={ toFloat }
        icon="arrow-to-right" fallbackIcon="stop-circle"
        placeholder="stop" unit="ms"
      />
    </Col>
  </Row>

const SoundForm = ({ handleChange }, { id }) => {
  const fileSelector = createRef()

  return (
    <div>
      <FileSelector
        accept="audio/*,video/ogg"
        component={ id }
        ref={ fileSelector }
      />
      <TimingRow />
      <Row form>
        <Col>
          <SettingGroup
            model=".gain"
            icon="volume" placeholder="gain" unit="x"
          />
        </Col>
        <Col>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <Icon fixedWidth icon="file-audio" />
                </InputGroupText>
              </InputGroupAddon>
              <Control
                model=".src"
                component={ Input }
                placeholder="source"
                debounce={ 200 }
                className="form-control"
                style={{ fontFamily: 'Fira Mono' }}
              />
              <InputGroupAddon addonType="append">
                <Button
                  outline color="secondary"
                  style={{ minWidth: '3rem' }}
                  onClick={ () => {
                    fileSelector.current
                      .select()
                      .then(files => {
                        handleChange(
                          'src', `\${ this.files["${ files[0].localPath }"] }`
                        )
                      })
                      .catch(e => console.log('Error while inserting audio', e))
                  } }
                >
                  <Icon fixedWidth icon="folder" />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <small class="text-muted">Please note that, for security reasons, audio files must be either embedded in the study, hosted on the same server on which the study is running, or on a server with <a href="https://enable-cors.org/server.html" target="_blank" rel="noopener noreferrer">cross-origin resource sharing</a> enabled. Please also note that Chrome does not support loading sounds offline; please consider hosting the study on a server instead.</small>
        </Col>
      </Row>
    </div>
  )
}

SoundForm.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

const OscillatorForm = () =>
  <div>
    <TimingRow />
    <Row form>
      <Col>
        <SettingGroup
          model=".gain"
          icon="volume" placeholder="gain" unit="x"
        />
      </Col>
      <Col>
        <SettingGroup
          icon="water" placeholder="type"
        >
          <Control.select
            model=".options.type"
            className="form-control custom-select"
            style={{ fontFamily: 'Fira Mono' }}
          >
            <option value="sine">Sine wave</option>
            <option value="square">Square wave</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </Control.select>
        </SettingGroup>
      </Col>
    </Row>
    <Row form>
      <Col>
        <SettingGroup
          model=".options.frequency"
          icon="music" placeholder="frequency" unit="Hz"
        />
      </Col>
      <Col>
        <SettingGroup
          model=".options.detune"
          icon="tachometer-average" placeholder="detune" unit="cents"
        />
      </Col>
    </Row>
  </div>


const TypeForm = ({ type, item, handleChange }) => {
  switch (type) {
    case 'oscillator':
      return <OscillatorForm item={ item } handleChange={ handleChange } />
    case 'sound':
      return <SoundForm item={ item } handleChange={ handleChange } />
    default:
      return null
  }
}

const ItemForm = ({ timeline, activeItem, handleChange,
  add, duplicateCurrent, deleteCurrent
}) =>
  <CardBody>
    <Header
      activeItem={
        activeItem !== undefined
          ? timeline[activeItem]
          : undefined
      }
      add={ add }
      duplicateCurrent={ duplicateCurrent }
      deleteCurrent={ deleteCurrent }
    />
    {
      activeItem !== undefined
        ? <Fieldset model={ `.timeline[${ activeItem }]` }>
            <TypeForm
              type={ timeline[activeItem].type }
              item={ timeline[activeItem] }
              handleChange={ handleChange }
            />
          </Fieldset>
        : null
    }
  </CardBody>

export default ItemForm
