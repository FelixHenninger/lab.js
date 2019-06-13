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
        />
      </Col>
    </Row>
    <Row form>
      <Col>
        <Control.textarea
          model=".help"
          placeholder="Help"
          component={ Input }
          controlProps={{ type: 'textarea', bsSize: 'sm', rows: 1 }}
          className="mt-2 text-muted"
          style={{ padding: '6px 12px' }}
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
