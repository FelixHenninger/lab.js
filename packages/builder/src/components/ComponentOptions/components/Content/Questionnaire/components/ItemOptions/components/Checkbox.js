import React from 'react'

import { Control } from 'react-redux-form'
import { Row, Col, Input } from 'reactstrap'

import { CodingGroup } from './Coding'

// TODO: Collapse this code with the radio button UI

export default ({ data }) =>
  <>
    <Row form>
      <Col>
        <Control
          model=".label"
          placeholder="Question"
          component={ Input }
        />
      </Col>
    </Row>
    <CodingGroup
      data={ data.options }
      model=".options"
      icon="square"
    />
  </>
