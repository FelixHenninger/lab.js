import React from 'react'

import { Field } from 'formik'
import { FormGroup, Label, Col } from 'reactstrap'

import Hint from '../../../../Hint'
import { Input } from '../../../../Form'

export default () =>
  <FormGroup row>
    <Label xs={ 2 } for="indexParameter">
      Name
      <Hint
        title="Iteration counter"
        className="float-right"
        placement="left"
      >
        <p className="font-weight-bold">
          Automatically add a parameter (with a given name) that counts iterations.
        </p>
        <p>
          The counter is always increasing, even if the loop rows are shuffled.
        </p>
      </Hint>
    </Label>
    <Col xs={10}>
      <Field
        name="indexParameter"
        component={ Input }
        className="text-monospace"
      />
    </Col>
  </FormGroup>
