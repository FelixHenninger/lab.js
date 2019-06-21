import React from 'react'

import { Control } from 'react-redux-form'
import { Row, Col,
  Input, InputGroup, InputGroupAddon, InputGroupText,
  FormGroup, Label, FormText } from 'reactstrap'

import { CollapsingOptions } from './BaseOptions'
import Icon from '../../../../../../../Icon'

const ExtraOptions = ({ type }) => {
  switch (type) {
    case 'number':
      return <>
        <FormGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrow-to-bottom" fallback="arrow-down" />
              </InputGroupText>
            </InputGroupAddon>
            <Control
              model=".attributes.min"
              placeholder="No lower limit"
              component={ Input }
              style={{ fontFamily: 'Fira Mono' }}
            />
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrow-to-top" fallback="arrow-up" />
              </InputGroupText>
            </InputGroupAddon>
            <Control
              model=".attributes.max"
              placeholder="No upper limit"
              component={ Input }
              style={{ fontFamily: 'Fira Mono' }}
            />
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="shoe-prints" />
              </InputGroupText>
            </InputGroupAddon>
            <Control
              model=".attributes.step"
              placeholder="Default step (1)"
              component={ Input }
              style={{ fontFamily: 'Fira Mono' }}
            />
          </InputGroup>
        </FormGroup>
      </>
    default:
      return null
  }
}

export default ({ rowIndex, type, data }) =>
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
        type === 'input' && <>
          <FormGroup className="my-2">
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
          <ExtraOptions type={ data.attributes && data.attributes.type } />
        </>
      }
    />
  </>
