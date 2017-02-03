import React from 'react'
import Card from '../../../Card'
import Hint from '../../../Hint'
import { FormGroup, Col, Label } from 'reactstrap'
import { Control } from 'react-redux-form'

export default (props) =>
  <Card title="Advanced options" open={false} { ...props } >
    <FormGroup row>
      <Col xs={2}>
        <Label
          xs={2}
          style={{
            paddingTop: '0', // This is a hack to override .col-form-label
          }}
        >
          Preparation
        </Label>
      </Col>
      <Col xs={10}>
        <FormGroup check>
          <Label check>
            <Control.checkbox
              model=".tardy"
              className="form-check-input"
            />
            &thinsp;
            Tardy
          </Label>
          <Hint
            title="Tardiness"
            style={{
              marginLeft: '1rem',
            }}
          >
            If a component is set to be <em>tardy</em>, it will prepare
            at the last possible moment, just before it is run.
          </Hint>
        </FormGroup>
      </Col>
    </FormGroup>
  </Card>
