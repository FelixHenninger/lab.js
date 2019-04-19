import React, { useState } from 'react'
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

const PluginHeader = ({ metaData }) =>
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

const PluginOption = ({ option, value, label, type, defaultValue,
  placeholder, help }) =>
  <FormGroup row>
    <Label for={ option } sm={ 3 }>{ label }</Label>
    <Col sm={ 9 }>
      <Control.text
        defaultValue={ value || defaultValue }
        model={ `.${ option }` }
        component={ Input }
        placeholder={ placeholder }
        style={{
          fontFamily: 'Fira Mono',
        }}
        debounce={ 300 }
      />
      {
        help && <small className="form-text text-muted">{ help }</small>
      }
    </Col>
  </FormGroup>

const PluginOptions = ({ index, data, metaData }) =>
  <Fieldset model={ `.plugins[${ index }]` }>
    {
      Object.entries(metaData.options).map(
        ([option, { label, type, default: defaultValue, placeholder, help }]) =>
          <PluginOption
            key={ `plugin-${ index }-${ option }` }
            option={ option }
            value={ data[option] }
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
            Object.entries(plugins).map(([type, pluginData]) =>
              <ListGroupItem
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

const PluginAddButton = (_, { store, id }) => {
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
        outline color="muted"
        className="hover-target"
        onClick={ () => setModalOpen(true) }
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

const Plugin = ({ index, data, metaData }) =>
  <CardBody className="border-bottom">
    <PluginHeader index={ index } data={ data } metaData={ metaData } />
    <PluginOptions index={ index } data={ data } metaData={ metaData } />
  </CardBody>

export default ({ id, data }) =>
  <Card title="Plugins" wrapContent={ false }>
    <ComponentForm
      id={ id }
      data={ data }
      keys={ ['plugins'] }
    >
      {
        (data.plugins || [])
          .map(pluginData => ({
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
            />
          )
      }
    </ComponentForm>
    <PluginAddButton />
  </Card>
