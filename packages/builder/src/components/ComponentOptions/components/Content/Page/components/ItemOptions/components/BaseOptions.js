import React from 'react'
import { Control } from 'react-redux-form'
import { Row, Col, Input, CustomInput } from 'reactstrap'

export const BaseOptions = ({ rowIndex }) =>
  <>
    <hr />
    <Row form className="my-2">
      <Col>
        <Control
          model=".name"
          placeholder="Name"
          component={ Input }
          className="font-weight-bold"
          controlProps={{
            style: {
              fontFamily: 'Fira Mono',
            }
          }}
        />
      </Col>
    </Row>
    <Row form className="my-2">
      <Col>
        <Control.checkbox
          model=".required"
          component={ CustomInput }
          controlProps={{
            type: 'checkbox',
            label: 'Require answer',
            id: `item-required-${ rowIndex }`,
            style: {
              fontFamily: 'Fira Mono',
            }
          }}
        />
      </Col>
    </Row>
    <Row form className="my-2">
      <Col>
        <Control.textarea
          model=".help"
          placeholder="Help / further instructions"
          component={ Input }
          controlProps={{
            type: 'textarea', bsSize: 'sm',
            rows: 3
          }}
          className="mt-2 text-muted"
          style={{ padding: '6px 12px' }}
        />
      </Col>
    </Row>
  </>
