import React from 'react'

import { range } from 'lodash'
import { Control, Field } from 'react-redux-form'
import { Row, Col, FormGroup, Label, FormText,
  Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'

import { CodingGroup } from './Coding'
import { CollapsingOptions } from './BaseOptions'

export default ({ data, rowIndex }) =>
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
    <CodingGroup
      data={ data.items }
      model=".items"
      itemModel={ `.rows[${ rowIndex }][0]` }
      icon="ellipsis-h-alt"
      iconFallbackWeight="s"
    />
    <CollapsingOptions
      rowIndex={ rowIndex }
    >
      <Row>
        <Col>
          <FormGroup className="my-2">
            <Label for={ `page-item-${ rowIndex }-width` } className="mb-0">
              Scale width
            </Label>
            <FormText color="muted">
              How many points to offer
            </FormText>
            <Field model=".width" className="mt-1">
              <FormGroup>
                {
                  [5, 7, 9, 11].map(w =>
                    <div
                      key={ `page-item-${ rowIndex }-width-${ w }` }
                      className="custom-radio custom-control"
                    >
                      <input
                        type="radio" value={ `${ w }` }
                        id={ `page-item-${ rowIndex }-width-${ w }` }
                        className="custom-control-input"
                      />
                      <label
                        htmlFor={ `page-item-${ rowIndex }-width-${ w }` }
                        className="custom-control-label"
                      >
                        { w }
                      </label>
                    </div>
                  )
                }
              </FormGroup>
            </Field>
          </FormGroup>
        </Col>
        <Col>
          <FormGroup className="my-2">
            <Label for={ `page-item-${ rowIndex }-anchors` } className="mb-0">
              Anchors
            </Label>
            <FormText color="muted">
              Scale anchors
            </FormText>
            <div className="mt-2">
              {
                range(data.width).map(i =>
                  <Row form
                    className="my-1"
                    key={ `page-item-${ rowIndex }-anchors-${ i }` }
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
                        <Control
                          model={ `.anchors[${ i }]` }
                          component={ Input }
                          debounce={ 300 }
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
