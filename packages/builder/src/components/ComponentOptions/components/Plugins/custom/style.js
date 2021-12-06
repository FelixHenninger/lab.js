import React from 'react'
import { Field } from 'formik'

import { PluginHeader } from '../generic'
import { Input, CustomInput } from '../../../../Form'
import { Row, Col } from 'reactstrap'

const Color = ({ name, property, label }) =>
  <>
    <Col sm="3" className="py-2">{ label }</Col>
    <Col sm="3">
      <Field
        name={ `${ name }.properties.--${ property }` }
        component={ Input }
        type="color"
        className="text-monospace"
      />
    </Col>
  </>

const StylePlugin = ({ name, metadata }) =>
  <>
    <PluginHeader metadata={ metadata } forceDivider={ true } />
    <Row className="my-2">
      <Color
        label="Text"
        property="color-text"
        name={ name }
      />
      <Color
        label="Background"
        property="color-background"
        name={ name }
      />
    </Row>
    <Row className="my-2">
      <Color
        label="Muted text"
        property="color-gray-content"
        name={ name }
      />
      <Color
        label="Muted background"
        property="color-gray-background"
        name={ name }
      />
    </Row>
    <Row className="my-2">
      <Color
        label="Border"
        property="color-border"
        name={ name }
      />
      <Color
        label="Internal border"
        property="color-border-internal"
        name={ name }
      />
    </Row>
    <Row>
      <Col>
        <hr />
      </Col>
    </Row>
    <Row className="mt-2 mb-3">
      <Col sm="3">
        Animate transition
      </Col>
      <Col sm="9">
        <Field
          name={ `${ name }.transition` } id={ `${ name }.transition` }
          component={ CustomInput }
          type="checkbox"
        />
      </Col>
    </Row>
  </>

export default StylePlugin
