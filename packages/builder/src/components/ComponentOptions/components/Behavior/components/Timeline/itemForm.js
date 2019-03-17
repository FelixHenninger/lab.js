import React, { createRef } from 'react'
import PropTypes from 'prop-types'

import { CardBody } from 'reactstrap'
import { Fieldset, Control } from 'react-redux-form'
import { Button, ButtonGroup,
  UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  InputGroup, InputGroupAddon, InputGroupText, Input, FormGroup,
  UncontrolledTooltip, Row, Col, Alert } from 'reactstrap'
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

const Header = ({ activeItem, add, duplicateCurrent, deleteCurrent }) =>
  <>
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
  </>

// Setting input group ---------------------------------------------------------

const SettingGroupIcon = ({ icon, fallbackIcon, tooltip, unit }) => {
  const addon = createRef()
  return (
    <>
      <div className="input-group-prepend" ref={ addon }>
        <InputGroupText>
          <Icon fixedWidth icon={ icon } fallback={ fallbackIcon } />
        </InputGroupText>
      </div>
      {
        tooltip
        ? <UncontrolledTooltip
            target={ addon }
            placement="left"
            delay={{ show: 0, hide: 150 }}
          >
            { tooltip }
            { unit && <span class="text-muted"> ({ unit })</span> }
          </UncontrolledTooltip>
        : null
      }
    </>
  )
}

const SettingGroupControl = ({ model, parser, defaultValue, placeholder }) =>
  <Control
    model={ model }
    parser={ parser }
    component={ Input }
    placeholder={ placeholder }
    defaultValue={ defaultValue }
    debounce={ 200 }
    className="form-control"
    style={{ fontFamily: 'Fira Mono' }}
  />

const GlobalSettings = () =>
  <>
    <Row form>
      <Col>
        <FormGroup>
          <InputGroup>
            <SettingGroupIcon
              icon="arrow-from-left"
              fallbackIcon="play-circle"
              tooltip="Start"
              unit="ms"
            />
            <SettingGroupControl
              model=".start" parser={ toFloat }
            />
            <SettingGroupIcon
              icon="arrow-to-right"
              fallbackIcon="stop-circle"
              tooltip="End"
              unit="ms"
            />
            <SettingGroupControl
              model=".stop" parser={ toFloat }
            />
            <SettingGroupIcon
              icon="volume"
              tooltip="Gain"
              unit="fraction"
            />
            <SettingGroupControl
              model=".gain" placeholder="gain"
              defaultValue={ 1.0 } parser={ toFloat }
            />
          </InputGroup>
        </FormGroup>
      </Col>
      <Col>
        <FormGroup>
          <InputGroup>
            <SettingGroupIcon
              icon="location-arrow"
              tooltip="Panning"
              unit="-1 … +1"
            />
            <SettingGroupControl
              model=".pan" placeholder="pan" parser={ toFloat }
            />
            <SettingGroupIcon
              icon="plane-departure"
              tooltip="Ramp up"
              unit="ms"
            />
            <SettingGroupControl
              model=".rampUp" parser={ toFloat }
            />
            <SettingGroupIcon
              icon="plane-arrival"
              tooltip="Ramp down"
              unit="ms"
            />
            <SettingGroupControl
              model=".rampDown" parser={ toFloat }
            />
          </InputGroup>
        </FormGroup>
      </Col>
    </Row>
  </>

const SoundForm = ({ handleChange }, { id }) => {
  const fileSelector = createRef()

  return (
    <>
      <FileSelector
        accept="audio/*,video/ogg"
        component={ id }
        ref={ fileSelector }
      />
      <GlobalSettings />
      <Row form>
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
          <small className="text-muted">Please note that, for security reasons, audio files must be either embedded in the study, hosted on the same server on which the study is running, or on a server with <a href="https://enable-cors.org/server.html" target="_blank" rel="noopener noreferrer">cross-origin resource sharing</a> enabled. Please also note that Chrome and Safari do not support loading sounds offline; please consider hosting the study on a server instead.</small>
        </Col>
      </Row>
    </>
  )
}

SoundForm.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

const OscillatorForm = () =>
  <>
    <GlobalSettings />
    <Row form>
      <Col>
        <FormGroup>
          <InputGroup>
            <SettingGroupIcon
              icon="integral" fallbackIcon="water"
              tooltip="Waveform"
            />
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
          </InputGroup>
        </FormGroup>
      </Col>
      <Col>
        <FormGroup>
          <InputGroup>
            <SettingGroupIcon
              icon="music"
              tooltip="Frequency"
              unit="Hz"
            />
            <SettingGroupControl
              model=".options.frequency" placeholder="frequency (Hz)"
            />
            <SettingGroupIcon
              icon="tachometer-average"
              tooltip="Detune"
              unit="cents"
            />
            <SettingGroupControl
              model=".options.detune" placeholder="detune (cents)"
            />
          </InputGroup>
        </FormGroup>
      </Col>
    </Row>
  </>


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
