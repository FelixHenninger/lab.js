import React, { useState, Component } from 'react'
import PropTypes from 'prop-types'

import { FormGroup, Input, Label, Col,
  Button, ListGroup, ListGroupItem,
  Card as BaseCard, CardBody } from 'reactstrap'
import { Fieldset, Control } from 'react-redux-form'

import Card from '../../../Card'
import Icon from '../../../Icon'
import ComponentForm from '../Form'
import Modal from '../../../Modal'
import Confirm from '../../../Modal/components/Confirm'

import { plugins, loadPlugin } from '../../../../logic/plugins/library'

const PluginHeader = ({ index, metaData, formDispatch }) =>
  <>
    <h3 className="h5">
      { metaData.title }
      {
        metaData.description
          && <small className="text-muted"> · { metaData.description }</small>
      }
    </h3>
    <hr />
  </>

const PluginControl = ({ option, value, type, options, defaultValue, placeholder }) => {
  switch (type) {
    case 'select':
      return <Control.select
        defaultValue={ value || defaultValue }
        model={ `.${ option }` }
        className="form-control custom-select"
        style={{
          fontFamily: 'Fira Mono',
        }}
        debounce={ 300 }
      >
        { options.map(o => <option value={ o.coding }>{ o.label }</option>) }
      </Control.select>
    default:
      return <Control.text
        defaultValue={ value || defaultValue }
        model={ `.${ option }` }
        component={ Input }
        placeholder={ placeholder }
        style={{
          fontFamily: 'Fira Mono',
        }}
        debounce={ 300 }
      />
  }
}

const PluginOption = (props) =>
  <FormGroup row>
    <Label for={ props.option } sm={ 3 }>{ props.label }</Label>
    <Col sm={ 9 }>
      <PluginControl { ...props } />
      {
        props.help &&
          <small className="form-text text-muted">{ props.help }</small>
      }
    </Col>
  </FormGroup>

const PluginOptions = ({ index, data, metaData }) =>
  <Fieldset model={ `.plugins[${ index }]` }>
    {
      Object.entries(metaData.options).map(
        ([option, { label, type, options=[], default: defaultValue, placeholder, help }]) =>
          <PluginOption
            key={ `plugin-${ index }-${ option }` }
            option={ option }
            value={ data[option] }
            options={ options }
            label={ label }
            type={ type }
            defaultValue={ defaultValue }
            placeholder={ placeholder }
            help={ help }
          />
      )
    }
  </Fieldset>

const PluginAddModal = ({ isOpen, onRequestClose: requestClose, onAdd }) =>
  <Modal
    isOpen={ isOpen }
    onRequestClose={ requestClose }
  >
    <Confirm
      title="Plugins"
      closeHandler={ requestClose }
    >
      <p><strong>Plugins change the behavior of a component</strong>, and can add further functionality. Please select one to include it.</p>
      <BaseCard className="card-flush">
        <ListGroup className="list-group-flush">
          {
            Object.entries(plugins).map(([type, pluginData], index) =>
              <ListGroupItem
                key={ `plugin-available-${ index }` }
                action style={{ cursor: 'pointer' }}
                onClick={ () => {
                  onAdd(type)
                  requestClose()
                } }
              >
                <strong>{ pluginData.title }</strong>
              </ListGroupItem>
            )
          }
        </ListGroup>
      </BaseCard>
      <div className="mt-3">
        <small className="text-muted">
          Missing something? Ideas for improving things? Please <a href="https://labjs.readthedocs.io/en/latest/meta/contribute/index.html" target="_blank" rel="noopener noreferrer">suggest or contribute</a>!
        </small>
      </div>
    </Confirm>
  </Modal>

const PluginAddButton = ({ muted }, { store, id }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const addPlugin = (type) => {
    console.log('adding plugin of type', type)
    return store.dispatch({
      type: 'ADD_PLUGIN',
      id, pluginType: type,
    })
  }

  return (
    <CardBody>
      <PluginAddModal
        isOpen={ modalOpen }
        onRequestClose={ () => setModalOpen(false) }
        onAdd={ addPlugin }
      />
      <Button
        size="sm" block
        outline color={ muted ? 'muted' : 'secondary' }
        className="hover-target"
        onClick={ () => setModalOpen(true) }
        onMouseUp={ e => e.target.blur() }
      >
        <Icon icon="plus" />
      </Button>
    </CardBody>
  )
}

PluginAddButton.contextTypes = {
  store: PropTypes.object,
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

const Plugin = ({ index, data, metaData, formDispatch }) =>
  <CardBody className="border-bottom">
    {/* Hidden field to preserve the plugin type option */}
    <Control.text
      model={ `.plugins[${ index }].type` }
      defaultValue={ data.type }
      hidden={ true }
    />
    <PluginHeader index={ index } data={ data } metaData={ metaData } formDispatch={ formDispatch }/>
    <PluginOptions index={ index } data={ data } metaData={ metaData } />
  </CardBody>

const PluginHint = ({ visible }) =>
  visible
    ? <div className="text-center p-5 pb-2">
        <Icon
          icon="plug"
          className="d-block text-muted p-3"
          style={{
            fontSize: '3.5rem',
          }}
        />
        <div className="text-muted">
          <strong>
            Plugins extend components' functionality
          </strong><br />
          <small>Please click below to add one.</small>
        </div>
      </div>
    : null

export default class extends Component {
  constructor(props) {
    super(props)
    this.formDispatch = () => console.log('invalid dispatch')
  }

  render() {
    const { id, data } = this.props
    return (
      <Card title="Plugins" badge="Beta" wrapContent={ false }>
        <PluginHint visible={ (data.plugins || []).length === 0 } />
        <ComponentForm
          id={ id }
          data={ data }
          keys={ ['plugins'] }
          // The react-redux-form logic converts the plugins array into
          // an object. This reverts that change before saving the data.
          postProcess={ data => ({
            ...data,
            plugins: Array.isArray(data.plugins)
              ? data.plugins
              : Object.values(data.plugins)
          }) }
          getDispatch={ dispatch => this.formDispatch = dispatch }
        >
          {
            (data.plugins || []).map(pluginData => ({
                pluginData,
                metaData: loadPlugin(pluginData.type),
              }))
              .filter(({ metaData }) => metaData !== undefined)
              .map(({ pluginData, metaData }, index) =>
                <Plugin
                  key={ `plugin-${ index }` }
                  index={ index }
                  data={ pluginData }
                  metaData={ metaData }
                  formDispatch={ action => this.formDispatch(action) }
                  // TODO: Reduce prop drilling
                />
              )
          }
        </ComponentForm>
        <PluginAddButton muted={ (data.plugins || []).length > 0 } />
      </Card>
    )
  }
}
