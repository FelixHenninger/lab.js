import React from 'react'

import { Control } from 'react-redux-form'
import { Row, Col, Input } from 'reactstrap'

export default () =>
  <>
    <Row form>
      <Col>
        <Control
          model=".title"
          component={ Input }
          className="font-weight-bold"
        />
      </Col>
    </Row>
    <Row form>
      <Col>
        <Control.textarea
          model=".content"
          component={ Input }
          controlProps={{ type: 'textarea' }}
          className="mt-2"
        />
      </Col>
    </Row>
  </>
