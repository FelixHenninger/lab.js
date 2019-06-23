import React, { lazy, Suspense } from 'react'
import { Control } from 'react-redux-form'
import { CardBody, FormGroup, Col, Label,
  Input, InputGroup, InputGroupAddon } from 'reactstrap'

import Card from '../../../../../Card'
import Hint from '../../../../../Hint'
import Spinner from '../../../../../Spinner'

import { numberOrPlaceholder } from './util'

const TimelineWidget = lazy(() => import('./widget'))

export default ({ formDispatch, data }) =>
  <Card title="Timeline" badge="Beta" wrapContent={ false }>
    <Suspense fallback={ <Spinner /> }>
      <TimelineWidget data={ data } formDispatch={ formDispatch } />
    </Suspense>
    <hr />
    <CardBody>
      <FormGroup row>
        <Label for="timeout" xs="2">
          Timeout
          <Hint
            title="Timeout"
            className="float-right"
          >
            <p className="font-weight-bold">
              End component automatically after a given number of milliseconds.
            </p>
            <p className="text-muted">
              If responses are defined alongside a timeout, whichever comes first will end the component.
            </p>
          </Hint>
        </Label>
        <Col xs="10">
          <InputGroup>
            <Control
              model=".timeout"
              placeholder="Never"
              pattern={ numberOrPlaceholder }
              component={ Input }
              id="timeout"
              style={{
                fontFamily: 'Fira Mono',
              }}
              debounce={ 300 }
            />
            <InputGroupAddon addonType="append">
              <span className="input-group-text text-muted">ms</span>
            </InputGroupAddon>
          </InputGroup>
        </Col>
      </FormGroup>
    </CardBody>
  </Card>
