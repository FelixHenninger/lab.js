import React, { createRef } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { CardBody } from 'reactstrap'
import { Field } from 'formik'
import { Button, ButtonGroup,
  UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  InputGroup, InputGroupText, FormGroup,
  UncontrolledTooltip, Row, Col, Alert } from 'reactstrap'
import { capitalize } from 'lodash'

import Icon from '../../../../../Icon'
import FileSelectorField from '../../../../../FileSelector/field'
import { Input } from '../../../../../Form'

import { numberOrPlaceholder } from './util'

const itemDefaults = {
  gain: '', pan: '', rampUp: '', rampDown: ''
}

const Toolbar = (
  { add, duplicateCurrent, deleteCurrent, activeItem },
  { zoom, setZoom }
) =>
  <div style={{ position: 'absolute', right: '0' }}>
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
        <DropdownMenu>
          <DropdownItem header>Audio</DropdownItem>
          <DropdownItem
            onClick={ () => add({
              type: 'sound',
              payload: { src: '', loop: false },
              ...itemDefaults,
            }) }
          >
            Sound file
          </DropdownItem>
          <DropdownItem
            onClick={ () => add({
              type: 'oscillator',
              payload: { type: 'sine', frequency: '', detune: '' },
              ...itemDefaults,
            }) }
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
        disabled={ activeItem === undefined }
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
    <ButtonGroup className="ml-2">
      <Button
        outline color="secondary"
        disabled={ zoom === 0 }
        onClick={ () => setZoom(0) }
      >
        <Icon
          icon="search-plus" fixedWidth
          style={{
            position: 'relative',
            top: '0.5px'
          }}
         />
      </Button>
      <Button
        outline color="secondary"
        disabled={ zoom === 1 }
        onClick={ () => setZoom(1) }
      >
        <Icon
          icon="search-minus" fixedWidth
          style={{
            position: 'relative',
            top: '0.5px'
          }}
         />
      </Button>
    </ButtonGroup>
  </div>

Toolbar.contextTypes = {
  zoom: PropTypes.number,
  setZoom: PropTypes.func,
}

const _InteractionWarning = ({ firstComponentId }, { id }) => {
  // Check whether the current component is the first in the study
  // TODO: Add a more sophisticated check,
  // taking into account nested flow components
  if (firstComponentId === id) {
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

_InteractionWarning.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

const mapStateToProps = state => ({
  firstComponentId: state.components['root'].children[0]
})
const InteractionWarning = connect(mapStateToProps)(_InteractionWarning)

const Header = ({ activeItem, item, add, duplicateCurrent, deleteCurrent }) =>
  <>
    <Row form className="clearfix">
      <Col style={{ position: 'relative' }}>
        <Toolbar
          add={ add }
          duplicateCurrent={ duplicateCurrent }
          deleteCurrent={ deleteCurrent }
          activeItem={ activeItem }
        />
        {
          activeItem !== undefined
            ? <h3 className="h5 mt-2">
                { capitalize(item.type) }
              </h3>
            : <div className="text-muted text-center">
                <small>Please add or select a timeline item</small>
              </div>
        }
      </Col>
    </Row>
    {
      activeItem !== undefined
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
            { unit && <span className="text-muted"> ({ unit })</span> }
          </UncontrolledTooltip>
        : null
      }
    </>
  )
}

const SettingGroupControl = ({ model, ...props }) =>
  <Field
    name={ model }
    component={ Input }
    className="text-monospace"
    { ...props }
  />

const GlobalSettings = ({ activeItem }) =>
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
              model={ `timeline[${ activeItem }].start` }
              pattern={ numberOrPlaceholder }
            />
            <SettingGroupIcon
              icon="arrow-to-right"
              fallbackIcon="stop-circle"
              tooltip="End"
              unit="ms"
            />
            <SettingGroupControl
              model={ `timeline[${ activeItem }].stop` }
              pattern={ numberOrPlaceholder }
            />
            <SettingGroupIcon
              icon="volume"
              tooltip="Gain"
              unit="fraction"
            />
            <SettingGroupControl
              model={ `timeline[${ activeItem }].gain` }
              placeholder="gain"
              pattern={ numberOrPlaceholder }
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
              model={ `timeline[${ activeItem }].pan` }
              placeholder="pan"
              pattern={ numberOrPlaceholder }
            />
            <SettingGroupIcon
              icon="plane-departure"
              tooltip="Ramp up duration"
              unit="ms"
            />
            <SettingGroupControl
              model={ `timeline[${ activeItem }].rampUp` }
              placeholder="0"
              pattern={ numberOrPlaceholder }
            />
            <SettingGroupIcon
              icon="plane-arrival"
              tooltip="Ramp down duration"
              unit="ms"
            />
            <SettingGroupControl
              model={ `timeline[${ activeItem }].rampDown` }
              placeholder="0"
              pattern={ numberOrPlaceholder }
            />
          </InputGroup>
        </FormGroup>
      </Col>
    </Row>
  </>

const SoundForm = ({ activeItem }, { id }) =>
  <>
    <GlobalSettings activeItem={ activeItem } />
    <Row form>
      <Col>
        <FormGroup>
          <FileSelectorField
            name={ `timeline[${ activeItem }].payload.src` }
            accept="audio/*,video/ogg"
            icon="file-audio"
            component={ id }
          />
        </FormGroup>
      </Col>
      <Col>
        <FormGroup>
          <InputGroup>
            <SettingGroupIcon
              icon="repeat"
              fallbackIcon="redo"
              tooltip="Loop audio"
              unit="boolean"
            />
            <Field
              name={ `timeline[${ activeItem }].payload.loop` }
              as="select"
              className="form-control custom-select text-monospace"
            >
              <option value="false">Play sound once</option>
              <option value="true">Repeat continuously</option>
            </Field>
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

SoundForm.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

const OscillatorForm = ({ activeItem }) =>
  <>
    <GlobalSettings activeItem={ activeItem } />
    <Row form>
      <Col>
        <FormGroup>
          <InputGroup>
            <SettingGroupIcon
              icon="integral" fallbackIcon="water"
              tooltip="Waveform"
            />
            <Field
              name={ `timeline[${ activeItem }].payload.type` }
              as="select"
              className="text-monospace form-control custom-select"
            >
              <option value="sine">Sine wave</option>
              <option value="square">Square wave</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </Field>
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
              model={ `timeline[${ activeItem }].payload.frequency` }
              placeholder="frequency (Hz)"
              pattern={ numberOrPlaceholder }
            />
            <SettingGroupIcon
              icon="tachometer-average"
              tooltip="Detune"
              unit="cents"
            />
            <SettingGroupControl
              model={ `timeline[${ activeItem }].payload.detune` }
              placeholder="detune (cents)"
              pattern={ numberOrPlaceholder }
            />
          </InputGroup>
        </FormGroup>
      </Col>
    </Row>
  </>


const TypeForm = ({ activeItem, item, handleChange }) => {
  switch (item.type) {
    case 'oscillator':
      return <OscillatorForm
        activeItem={ activeItem }
        item={ item }
        handleChange={ handleChange }
      />
    case 'sound':
      return <SoundForm
        activeItem={ activeItem }
        item={ item }
        handleChange={ handleChange }
      />
    default:
      return null
  }
}

const ItemForm = ({ timeline, activeItem, handleChange,
  add, duplicateCurrent, deleteCurrent
}) =>
  <CardBody>
    <Header
      activeItem={ activeItem }
      item={ activeItem !== undefined ? timeline[activeItem] : undefined }
      add={ add }
      duplicateCurrent={ duplicateCurrent }
      deleteCurrent={ deleteCurrent }
    />
    {
      activeItem !== undefined
        ? <TypeForm
            activeItem={ activeItem }
            item={ timeline[activeItem] }
            handleChange={ handleChange }
          />
        : null
    }
  </CardBody>

export default ItemForm
