import React, { Component } from 'react'
import { Control, actions } from 'react-redux-form'
import { Col, CardBody,
  FormGroup, Input, CustomInput, InputGroup, Label } from 'reactstrap'

import { uniqBy, groupBy } from 'lodash'

import Form from '../../Form'
import Card from '../../../../Card'
import Grid from '../../../../Grid'
import { GridCell, HeaderCell } from './cells'
import { Footer } from './footer'
import ShuffleGroups from './components/ShuffleGroups'

const switchLabels = ({
  templateParameters,
  sample={ n: undefined }
}, labels) => {
  const samples = parseInt(sample.n)
  const parameters = templateParameters.rows.length

  if (samples < parameters) {
    return labels[0]
  } else if (isNaN(samples) || samples === parameters) {
    return labels[1]
  } else {
    return labels[2]
  }
}

const SampleWidget = ({ data }) =>
  <FormGroup row>
    <Label xs={ 2 } for="samples">
      Sample
    </Label>
    <Col xs={10}>
      <InputGroup>
        <Control
          id="sampleN"
          model=".sample.n"
          placeholder={
            (data.sample || {}).mode === 'draw-replace'
              ? 'As many as rows above'
              : 'Use all'
          }
          type="number"
          style={{
            fontFamily: 'Fira Mono',
          }}
          component={ Input }
          controlProps={{
            min: 0
          }}
          debounce={ 300 }
        />
        <Control.select
          id="sampleMode"
          model=".sample.mode"
          component={ CustomInput }
          controlProps={{
            type: 'select',
          }}
          style={{
            fontFamily: 'Fira Mono',
          }}
        >
          <option value="sequential">
            In sequence
          </option>
          <option value="draw-shuffle">
            {
              switchLabels(data, [
                'Sampled without replacement',
                'In random order',
                'Sampled without replacement (then shuffled)'
              ])
            }
          </option>
          <option value="draw">
            Sampled without replacement (in blocks)
          </option>
          <option value="draw-replace">
            Sampled with replacement
          </option>
        </Control.select>
      </InputGroup>
    </Col>
  </FormGroup>

export default class extends Component {
  constructor(props) {
    super(props)
    this.formDispatch = () => console.log('invalid dispatch')
  }

  render() {
    const { id, data } = this.props
    const { columns, rows } = data.templateParameters

    return (
      <>
        <Card title="Loop" wrapContent={ false }>
          <Form
            id={ id }
            data={ data }
            keys={ ['templateParameters', 'shuffle', 'sample'] }
            getDispatch={ dispatch => this.formDispatch = dispatch }
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
              columns={ columns }
              data={ rows }
              formDispatch={ action => this.formDispatch(action) }
            />
            <CardBody>
              <SampleWidget data={ data } />
            </CardBody>
          </Form>
        </Card>
        <Card title="Further options"
          open={ uniqBy(columns, c => c.shuffleGroup).length > 1 }
          collapsable={ true }
          wrapContent={ false }
          className="mt-4"
        >
          <CardBody className="pb-0">
            <h2 className="h6">Parameter groups</h2>
          </CardBody>
          <ShuffleGroups
            id={ id }
            groups={
              groupBy(
                columns
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
            globalShuffle={ data.sample.mode !== 'sequential' }
          />
        </Card>
      </>
    )
  }
}
