import React from 'react'
import Card from '../../../../../Card'
import { Col, FormGroup, Label } from 'reactstrap'
import { Control } from 'react-redux-form'

export default (props) =>
  <Card title="Sequence" { ...props }>
    <Col xs="2" style={{ paddingLeft: '0' }}>Order</Col>
    <Col xs="6">
      <FormGroup check>
        <Label check>
          <Control.checkbox
            model=".shuffle"
            className="form-check-input"
          />
          &thinsp;
          Shuffle
        </Label>
      </FormGroup>
    </Col>
  </Card>
