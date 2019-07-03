import React from 'react'

import { Control } from 'react-redux-form'
import { Row, Col, Input } from 'reactstrap'

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
    />
  </>
