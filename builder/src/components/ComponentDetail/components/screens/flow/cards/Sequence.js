import React from 'react'
import Card from '../../../../../Card'
import { Col, FormGroup, Label } from 'reactstrap'
import { Control } from 'react-redux-form'

export default (props) =>
  <Card title="Content" { ...props }>
    <FormGroup row>
      <Col xs={2}>
        <Label
          xs={2}
          style={{
            paddingTop: '0', // This is a hack to override .col-form-label
          }}
        >
          Order
        </Label>
      </Col>
      <Col xs={10}>
        <FormGroup check>
          <Label check>
            <Control.checkbox
              model=".shuffle"
              className="form-check-input"
              debounce={ 300 }
            />
            &thinsp;
            Shuffle
          </Label>
        </FormGroup>
      </Col>
    </FormGroup>
  </Card>
