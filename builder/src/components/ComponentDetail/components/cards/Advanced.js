import React from 'react'
import Card from '../../../Card'
import Hint from '../../../Hint'
import { FormGroup, Col, Label } from 'reactstrap'
import { Control } from 'react-redux-form'

export default (props) =>
  <Card title="Advanced options" open={false} { ...props } >
    <Col xs="2" style={{ paddingLeft: '0' }}>Preparation</Col>
    <Col xs="6">
      <FormGroup check>
        <Label check>
          <Control.checkbox
            model=".tardy"
            className="form-check-input"
          />
          &thinsp;
          Tardy
        </Label>
        <Hint title="Tardiness">
          If a component is set to be <em>tardy</em>, it will prepare
          at the last possible moment, just before it is run.
        </Hint>
      </FormGroup>
    </Col>
  </Card>
