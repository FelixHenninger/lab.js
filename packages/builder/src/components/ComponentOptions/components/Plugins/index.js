import React, { useState } from 'react'
import { FormGroup, Input, Label, Col, Button, CardBody } from 'reactstrap'
import { Fieldset, Control } from 'react-redux-form'

import Card from '../../../Card'
import Icon from '../../../Icon'
import ComponentForm from '../Form'
import Modal from '../../../Modal'
import Confirm from '../../../Modal/components/Confirm'

import { loadPlugin } from '../../../../logic/plugins/library'

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
        help && <small class="form-text text-muted">{ help }</small>
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

const PluginAddModal = ({ isOpen, onRequestClose: requestClose }) =>
  <Modal
    isOpen={ isOpen }
    onRequestClose={ requestClose }
  >
    <Confirm
      title="Add Plugin"
      closeHandler={ requestClose }
    >
      Foo bar
    </Confirm>
  </Modal>

const PluginAddButton = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <CardBody>
      <PluginAddModal
        isOpen={ modalOpen }
        onRequestClose={ () => setModalOpen(false) }
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
