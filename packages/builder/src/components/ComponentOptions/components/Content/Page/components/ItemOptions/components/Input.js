import React from 'react'

import { Control } from 'react-redux-form'
import { Row, Col, Input, FormGroup, Label, FormText } from 'reactstrap'

import { CollapsingOptions } from './BaseOptions'

export default ({ rowIndex, type }) =>
  <>
    <Row form>
      <Col>
        <Control
          model=".label"
          placeholder="Question"
          component={ Input }
          debounce={ 300 }
        />
      </Col>
    </Row>
    <CollapsingOptions
      rowIndex={ rowIndex }
      validation={
        type === 'input' && <FormGroup className="my-2">
          <Label for={ `page-item-${ rowIndex }-attrs-type` } className="mb-1">
            Data type
          </Label>
          <FormText color="muted" className="mb-2">
            Check input format, and restrict input
          </FormText>
          <Control.select
            model=".attributes.type"
            className="form-control custom-select"
            style={{ fontFamily: 'Fira Mono' }}
            controlProps={{
              id: `page-item-${ rowIndex }-attrs-type`,
            }}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
          </Control.select>
        </FormGroup>
      }
    />
  </>
