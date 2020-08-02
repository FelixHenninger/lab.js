import React from 'react'

import { Field } from 'formik'
import { Row, Col } from 'reactstrap'

import { Input } from '../../../../../../../Form'

export default ({ name }) =>
  <>
    <Row form>
      <Col>
        <Field
          name={ `${ name }.title` }
          placeholder="Title"
          component={ Input }
          className="font-weight-bold"
        />
      </Col>
    </Row>
    <Row form>
      <Col>
        <Field
          name={ `${ name }.content` }
          as="textarea"
          placeholder="Text"
          className="form-control mt-2"
        />
      </Col>
    </Row>
  </>
