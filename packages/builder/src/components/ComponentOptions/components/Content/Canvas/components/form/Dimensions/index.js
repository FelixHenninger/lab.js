import React from 'react'

import { Field } from 'formik'

import { InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'
import Icon from '../../../../../../../Icon'

import './index.css'

export default ({ selection, type }) =>
  <InputGroup className="dimension-toolbar minimal-width-addons ml-2">
    <InputGroupAddon addonType="prepend">
      <span className="input-group-text">
        <Icon icon="long-arrow-right" fixedWidth />
      </span>
    </InputGroupAddon>
    <Field
      name="left"
      placeholder="x"
      disabled={ type === undefined }
      className="form-control text-monospace"
    />
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <Icon icon="long-arrow-down" fixedWidth />
      </InputGroupText>
    </InputGroupAddon>
    <Field
      name="top"
      placeholder="y"
      disabled={ type === undefined }
      className="form-control text-monospace"
    />
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <Icon icon="redo" fixedWidth />
      </InputGroupText>
    </InputGroupAddon>
    <Field
      name="angle"
      placeholder="angle"
      disabled={ ['circle', 'i-text', undefined].includes(type) }
      className="form-control"
      style={{ fontFamily: 'Fira Mono' }}
    />
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <Icon icon="arrows-h" fixedWidth />
      </InputGroupText>
    </InputGroupAddon>
    <Field
      name="width"
      placeholder="width"
      disabled={
        ['i-text', undefined].includes(type)
        || (type === 'image' && selection.autoScale === 'width')
      }
      className="form-control text-monospace"
    />
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <Icon icon="arrows-v" fixedWidth />
      </InputGroupText>
    </InputGroupAddon>
    <Field
      name="height"
      placeholder="height"
      disabled={
        ['line', 'circle', 'i-text', undefined].includes(type)
        || (type === 'image' && selection.autoScale === 'height')
      }
      className="form-control"
      style={{ fontFamily: 'Fira Mono' }}
    />
  </InputGroup>
