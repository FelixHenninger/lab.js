import React from 'react'

import { Field } from 'formik'
import { Row, Col } from 'reactstrap'

import { CodingGroup } from './Coding'
import { CollapsingOptions } from './BaseOptions'

import { Input } from '../../../../../../../Form'

export default ({ name, index }) =>
  <>
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
      name={ `${ name }.options` }
      icon="circle"
    />
    <CollapsingOptions
      name={ name }
      index={ index }
      shuffle={ true }
    />
  </>
