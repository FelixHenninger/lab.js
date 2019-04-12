import React from 'react'
import { FormGroup, Input, Label, Col, CardBody } from 'reactstrap'
import { Fieldset, Control } from 'react-redux-form'

import Card from '../../../Card'
import ComponentForm from '../Form'

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

const Plugin = ({ index, data, metaData }) =>
  <CardBody>
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
  </Card>
