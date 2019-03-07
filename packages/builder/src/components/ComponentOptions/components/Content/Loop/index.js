import React, { Component } from 'react'
import { Control, Errors, actions } from 'react-redux-form'
import { Col, CardBody,
  FormGroup, Label, FormText, CustomInput } from 'reactstrap'

import { groupBy } from 'lodash'

import Form from '../../Form'
import Card from '../../../../Card'
import Grid from '../../../../Grid'
import { GridCell, HeaderCell } from './cells'
import { Footer } from './footer'
import ShuffleGroups from './components/ShuffleGroups'

export default class extends Component {
  constructor(props) {
    super(props)
    this.formDispatch = () => console.log('invalid dispatch')
  }

  render() {
    const { id, data } = this.props

    return (
      <>
        <Card title="Loop" wrapContent={ false }>
          <Form
            id={ id }
            data={ data }
            keys={ ['templateParameters', 'shuffle', 'sample'] }
            getDispatch={ dispatch => this.formDispatch = dispatch }
            validators={{
              '': {
                sampleSize: v =>
                  // Not valid if: Sample and replacement defined,
                  // *but* sample size larger than available rows
                  !(v.sample !== undefined &&
                    v.sample.n !== undefined &&
                    v.sample.replace !== true &&
                    v.sample.n > v.templateParameters.rows.length)
              },
            }}
          >
            <Grid
              model=".templateParameters"
              className="border-top-0"
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
                  <Control.checkbox
                    model=".shuffle"
                    component={ CustomInput }
                    controlProps={{
                      id: 'shuffle',
                      type: 'checkbox',
                      label: 'Shuffle repetitions',
                    }}
                  />
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
                  <Errors
                    model="local"
                    component={ props =>
                      <FormText color="danger">{ props.children }</FormText> }
                    messages={{
                      sampleSize: 'Without replacement, the number of samples can\'t be larger than the number of rows specified above.'
                    }}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col xs={{ size: 10, offset: 2 }}>
                  <Control.checkbox
                    model=".sample.replace"
                    component={ CustomInput }
                    controlProps={{
                      id: 'replace',
                      type: 'checkbox',
                      label: 'Draw with replacement',
                    }}
                  />
                </Col>
              </FormGroup>
            </CardBody>
          </Form>
        </Card>
        <Card title="Shuffle and sample" wrapContent={ false }>
          <CardBody className="pb-0">
            <h2 className="h6">Parameter groups</h2>
          </CardBody>
          <ShuffleGroups
            id={ id }
            groups={
              groupBy(
                data.templateParameters.columns
                  .filter(c => c.name !== '')
                  .map((c, i) => ({ ...c, id: i })),
                'shuffleGroup'
              )
            }
            moveHandler={
              (key, target) =>
                this.formDispatch(
                  actions.change(
                    `local.templateParameters.columns[${ key }]['shuffleGroup']`,
                    target
                  )
                )
            }
            globalShuffle={ data.shuffle }
          />
        </Card>
      </>
    )
  }
}
