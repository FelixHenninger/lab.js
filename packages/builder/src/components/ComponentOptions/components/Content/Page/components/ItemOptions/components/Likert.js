import React from 'react'

import { range } from 'lodash'
import { Field, FastField, useFormikContext, getIn } from 'formik'
import { Row, Col, FormGroup, Label, FormText,
  InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'

import { Input } from '../../../../../../../Form'

import { CodingGroup } from './Coding'
import { CollapsingOptions } from './BaseOptions'

export default ({ name, index }) => {
  const { values } = useFormikContext()
  const width = getIn(values, `${ name }.width`)

  return <>
    <Row form>
      <Col>
        <Field
          name={ `${ name }.label` }
          placeholder="Question"
          component={ Input }
        />
      </Col>
    </Row>
    <CodingGroup
      name={ `${ name }.items` }
      icon="ellipsis-h-alt"
      iconFallbackWeight="s"
    />
    <CollapsingOptions
      name={ name }
      index={ index }
      shuffle={ true }
    >
      <Row>
        <Col>
          <FormGroup className="my-2">
            <Label for={ `page-item-${ index }-width` } className="mb-0">
              Scale width
            </Label>
            <FormText color="muted">
              How many points to offer
            </FormText>
            <FormGroup>
              {
                [5, 7, 9, 11].map(w =>
                  <div
                    key={ `page-item-${ index }-width-${ w }` }
                    className="custom-radio custom-control"
                  >
                    <Field
                      name={ `${ name }.width` }
                      type="radio"
                      value={ `${ w }` }
                      id={ `page-item-${ index }-width-${ w }` }
                      className="custom-control-input"
                    />
                    <label
                      htmlFor={ `page-item-${ index }-width-${ w }` }
                      className="custom-control-label"
                    >
                      { w }
                    </label>
                  </div>
                )
              }
            </FormGroup>
          </FormGroup>
        </Col>
        <Col>
          <FormGroup className="my-2">
            <Label for={ `page-item-${ index }-anchors` } className="mb-0">
              Anchors
            </Label>
            <FormText color="muted">
              Scale anchors
            </FormText>
            <div className="mt-2">
              {
                range(width).map(i =>
                  <Row form
                    className="my-1"
                    key={ `page-item-${ index }-anchors-${ i }` }
                  >
                    <Col>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <small className="text-monospace text-muted">
                              { i + 1 }
                            </small>
                          </InputGroupText>
                        </InputGroupAddon>
                        <FastField
                          name={ `${ name }.anchors[${ i }]` }
                          component={ Input }
                        />
                      </InputGroup>
                    </Col>
                  </Row>
                )
              }
            </div>
          </FormGroup>
        </Col>
      </Row>
    </CollapsingOptions>
  </>
}
