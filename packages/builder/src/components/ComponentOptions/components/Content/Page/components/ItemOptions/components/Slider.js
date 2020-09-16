import React from 'react'

import { Field } from 'formik'
import { Row, Col } from 'reactstrap'

import { Input } from '../../../../../../../Form'

import { CollapsingOptions } from './BaseOptions'
import { ExtraOptions } from './Input'

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
    <CollapsingOptions
      name={ name }
      index={ index }
      borderTop={ false }
    >
      <div className="mt-2">
        <ExtraOptions name={ name } type="number" />
      </div>
    </CollapsingOptions>
  </>
