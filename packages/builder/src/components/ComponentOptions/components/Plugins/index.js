import React, { useState } from 'react'

import { Field } from 'formik'
import { FormGroup, Label, Col, Button } from 'reactstrap'
import { fromPairs } from 'lodash'

import Card from '../../../Card'
import Form from '../Form'
import Icon from '../../../Icon'

import { Input } from '../../../Form'
import { Table, DefaultRow } from '../../../Form/table'
import PluginAddModal from './modal'
import { loadPlugin } from '../../../../logic/plugins/library'

const PluginHeader = ({ metadata }) =>
  <>
    <h3 className="h5 mt-2">
      { metadata.title }
      {
        metadata.description
          && <small className="text-muted"> · { metadata.description }</small>
      }
    </h3>
    <hr className="my-3" />
  </>

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

 const PluginControl = ({ name, type, options=[], placeholder }) => {
    switch (type) {
      case 'select':
        return <Field
          name={ name } as="select"
          className="form-control custom-select text-monospace"
        >
          {
            options.map(o =>
              <option key={ `${ name }-${ o.coding }` } value={ o.coding }>
                { o.label }
              </option>
            )
          }
        </Field>
      default:
        return <Field
          name={ name }
          component={ Input }
          placeholder={ placeholder }
          className="text-monospace"
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

const PluginBody = ({ name, index, metadata }) =>
  <>
    {
      Object.entries(metadata.options).map(
        ([optionName, { default: defaultValue, ...optionProps }]) =>
          <PluginOption
            key={ `plugin-${ index }-${ optionName }` }
            name={ `${ name }.${ optionName }` }
            defaultValue={ defaultValue }
            { ...optionProps }
          />
      )
    }
  </>

const PluginRow = ({ index, name, data, arrayHelpers }) => {
  const metadata = loadPlugin(data.type)

  return (
    <DefaultRow index={ index } arrayHelpers={ arrayHelpers }>
      <PluginHeader metadata={ metadata } />
      <PluginBody
        name={ name } index={ index }
        data={ data } metadata={ metadata }
      />
    </DefaultRow>
  )
}

const getDefaultSettings = (pluginType) => {
  const metadata = loadPlugin(pluginType)

  return {
    type: pluginType,
    ...fromPairs(
      Object.entries(metadata.options)
        .map(([k, v]) => [k, v.default || ''])
    ),
  }
}

const PluginFooter = ({ addItem }) => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <tfoot>
      <tr>
        <td />
        <td>
          <PluginAddModal
            isOpen={ modalOpen }
            onRequestClose={ () => setModalOpen(false) }
            onAdd={ type => addItem(getDefaultSettings(type)) }
          />
          <Button
            size="sm" block
            outline color="muted"
            className="hover-target"
            onClick={ () => setModalOpen(true) }
            onMouseUp={ e => e.target.blur() }
          >
            <Icon icon="plus" />
          </Button>
        </td>
        <td />
      </tr>
    </tfoot>
  )
}

export default ({ id, data }) =>
  <Card title="Plugins" badge="Beta" wrapContent={ false }>
    <Form
      id={ id } data={ data }
      keys={ ['plugins'] }
    >
      <PluginHint
        visible={
          !data.plugins ||
          (Array.isArray(data.plugins) && data.plugins.length === 0)
        }
      />
      <Table
        name="plugins"
        row={ PluginRow }
        footer={ PluginFooter }
        className="no-header"
      />
    </Form>
  </Card>
