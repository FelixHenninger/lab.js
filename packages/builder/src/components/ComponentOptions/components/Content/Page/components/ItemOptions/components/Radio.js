import React from 'react'

import { Control } from 'react-redux-form'
import { Row, Col, Input } from 'reactstrap'

import { CodingGroup } from './Coding'

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
      data={ data.options }
      model=".options"
      itemModel={ `.rows[${ rowIndex }][0]` }
      icon="circle"
    />
  </>
