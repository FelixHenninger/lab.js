import React from 'react'
import Card from '../../../../../../Card'
import Grid from '../../../../../../Grid'
import { Col, CardBlock, FormGroup, Label } from 'reactstrap'
import { Control } from 'react-redux-form'

import { gridCell, headerCell } from './cells'

export default (props) =>
  <Card title="Loop" { ...props } wrapContent={false}>
    <Grid
      model=".templateParameters"
      addColumns
      defaultColumn={ { name: '', type: 'string' } }
      bodyCell={ gridCell }
      headerCell={ headerCell }
      columns={ props.data.columns }
      data={ props.data.rows }
      formDispatch={ props.formDispatch }
    />
    <CardBlock>
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
                model=".shuffle"
                className="form-check-input"
              />
              &thinsp;
              Shuffle
            </Label>
          </FormGroup>
        </Col>
      </FormGroup>
    </CardBlock>
  </Card>
