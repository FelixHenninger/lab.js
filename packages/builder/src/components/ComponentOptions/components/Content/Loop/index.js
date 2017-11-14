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
          <Label
            xs={ 2 }
            style={{
              paddingTop: '0', // This is a hack to override .col-form-label
            }}
          >
            Order
          </Label>
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
        <FormGroup row>
          <Label xs={ 2 } for="samples">
            Samples
          </Label>
          <Col xs={10}>
            <Control
              id="samples"
              model=".sample.n"
              placeholder="As many as specified"
              type="number"
              className="form-control"
              style={{
                fontFamily: 'Fira Mono',
              }}
              debounce={ 300 }
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Col xs={{ size: 10, offset: 2 }}>
            <FormGroup check>
              <Label check>
                <Control.checkbox
                  model=".sample.replace"
                  className="form-check-input"
                />
                Draw with replacement
              </Label>
            </FormGroup>
          </Col>
        </FormGroup>
      </CardBody>
    </Form>
  </Card>
