import React from 'react'
import { Control } from 'react-redux-form'
import { Col, CardBody, FormGroup, Label } from 'reactstrap'

import Form from '../../Form'
import Card from '../../../../Card'
import Grid from '../../../../Grid'
import { GridCell, HeaderCell } from './cells'
import { Footer } from './footer'

export default ({ id, data }) =>
  <Card title="Loop" wrapContent={ false }>
    <Form
      id={ id }
      data={ data }
      keys={ ['templateParameters', 'shuffle'] }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <Grid
        model=".templateParameters"
        addColumns
        maxColumns={12}
        defaultColumn={ { name: '', type: 'string' } }
        BodyContent={ GridCell }
        HeaderContent={ HeaderCell }
        Footer={ Footer }
        columns={ data.templateParameters.columns }
        data={ data.templateParameters.rows }
        formDispatch={ action => this.formDispatch(action) }
      />
      <CardBody>
        <FormGroup row>
          <Col xs={2}>
            <Label
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
                  debounce={ 300 }
                />
                &thinsp;
                Shuffle
              </Label>
            </FormGroup>
          </Col>
        </FormGroup>
      </CardBody>
    </Form>
  </Card>
