import React from 'react'

import { Field } from 'formik'
import { FormGroup, Col, Label } from 'reactstrap'

import Card from '../../Card'
import Hint from '../../Hint'

import Form from './Form'
import { CustomInput } from '../../Form'

export default ({ id, data }) =>
  <Card title="Advanced options">
    <Form
      id={ id } data={ data }
      keys={ ['scrollTop', '_template'] }
    >
      <FormGroup row>
        <Col xs={2}>
          <Label>
            Run
          </Label>
        </Col>
        <Col xs={10}>
          <FormGroup check>
            <Field
              name="scrollTop"
              component={ CustomInput }
              id="scrollTop"
              type="checkbox"
              inline={true}
              label="Scroll to top before running"
            />
            <Hint
              title="Scroll to Top"
              style={{
                marginLeft: '1rem',
              }}
            >
              <p className="font-weight-bold">
                Reset scroll position to the top of the page
                when showing content
              </p>
              <p className="text-muted">
                This is useful if the preceding and current screen
                both occupy a lot of vertical space, as it saves
                participants from having to scroll back upwards
                manually between pages.
              </p>
            </Hint>
          </FormGroup>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Col xs={2}>
          <Label>
            Display
          </Label>
        </Col>
        <Col xs={10}>
          <FormGroup check>
            <Field
              name="_template"
              component={ CustomInput }
              id="_template"
              type="checkbox"
              inline={true}
              label="Template"
            />
            <Hint
              title="Template"
              style={{
                marginLeft: '1rem',
              }}
            >
              <p className="font-weight-bold">
                Reduce visible settings so that only parameters can be changed.
              </p>
              <p className="text-muted">
                Making a component a template simplifies complex components and bundle nested hierarchies into a single module. This creates reusable components that are defined only by their parameters.
              </p>
              <p className="text-muted">
                Making a component a template prevents direct modification of all component details, and hides nested components.
              </p>
            </Hint>
          </FormGroup>
        </Col>
      </FormGroup>

    </Form>
  </Card>
