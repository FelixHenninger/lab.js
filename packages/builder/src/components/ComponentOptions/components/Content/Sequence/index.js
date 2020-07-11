import React from 'react'

import { Col, FormGroup, Label } from 'reactstrap'
import { Field } from 'formik'

import Form from '../../Form'
import { CustomInput } from '../../../../Form'
import Card from '../../../../Card'

export default ({ id, data }) =>
  <Card title="Content">
    <Form
      id={ id }
      data={ data }
      keys={ ['shuffle', 'localParameters'] }
    >
      <FormGroup row>
        <Col xs={2}>
          <Label
            style={{
              paddingTop: '0', // This is a hack to override .col-form-label
            }}
          >
            Order
          </Label>
        </Col>
        <Col xs={10}>
          <FormGroup check>
            <Field
              name="shuffle" id="shuffle"
              component={ CustomInput }
              type="checkbox"
              label="Shuffle nested components"
            />
          </FormGroup>
        </Col>
      </FormGroup>
    </Form>
  </Card>
