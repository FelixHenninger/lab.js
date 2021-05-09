import React from 'react'

import { Field } from 'formik'
import { FormGroup, Label, Col } from 'reactstrap'

import { Input, CustomInput } from '../../../Form'

const PluginHeader = ({ metadata, forceDivider=false }) =>
  <>
    <h3 className="h5 mt-2">
      { metadata.title }
      {
        metadata.description
          && <small className="text-muted"> · { metadata.description }</small>
      }
    </h3>
    {
      (forceDivider || Object.entries(metadata.options).length > 0)
        && <hr className="my-3" />
    }
  </>

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

const PluginOption = (props) => {
  switch(props.type) {
    case 'checkbox':
      return <FormGroup row>
        <Col sm={ 3 } className="text-right" style={{ paddingTop: '0.425rem'}}>
          <Field
            name={ props.name } id={ props.name }
            component={ CustomInput }
            type="checkbox"
          />
        </Col>
        <Label for={ props.name } sm={ 9 }>
          { props.label }
          {
            props.help &&
              <small className="form-text text-muted">{ props.help }</small>
          }
        </Label>
      </FormGroup>
    default:
      return <FormGroup row>
        <Label for={ props.option } sm={ 3 }>{ props.label }</Label>
        <Col sm={ 9 }>
          <PluginControl { ...props } />
          {
            props.help &&
              <small className="form-text text-muted">{ props.help }</small>
          }
        </Col>
      </FormGroup>
  }
}

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

const GenericPlugin = ({ index, name, metadata, data }) =>
  <>
    <PluginHeader metadata={ metadata } />
    <PluginBody
      name={ name } index={ index }
      data={ data } metadata={ metadata }
    />
  </>

export default GenericPlugin
