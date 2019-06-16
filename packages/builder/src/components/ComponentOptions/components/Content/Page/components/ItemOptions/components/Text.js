import React from 'react'

import { Control } from 'react-redux-form'
import { Row, Col, Input } from 'reactstrap'

export default () =>
  <>
    <Row form>
      <Col>
        <Control
          model=".title"
          placeholder="Title"
          component={ Input }
          className="font-weight-bold"
          debounce={ 300 }
        />
      </Col>
    </Row>
    <Row form>
      <Col>
        <Control.textarea
          model=".content"
          placeholder="Text"
          component={ Input }
          controlProps={{ type: 'textarea' }}
          className="mt-2"
          debounce={ 300 }
        />
      </Col>
    </Row>
  </>
