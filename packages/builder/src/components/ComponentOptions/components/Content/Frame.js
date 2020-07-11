import React from 'react'
import { Field } from 'formik'
import { CardBody, FormGroup, Label, FormText } from 'reactstrap'

import Form from '../Form'
import { Input } from '../../../Form'
import Card from '../../../Card'
import EditorField from '../../../Editor/field'

export default ({ id, data }) =>
  <Card title="Content"
    wrapContent={ false }
    className="flex-grow-1 d-flex flex-column"
  >
    {/* Holy multiply nested flexbox Batman! */}
    <Form
      id={ id }
      data={ data }
      keys={ ['context', 'contextSelector'] }
      className="flex-grow-1 d-flex flex-column"
    >
      <CardBody className="flex-grow-1 d-flex flex-column">
        <EditorField
          name="context"
          language="html"
        />
      </CardBody>
      <CardBody
        className="flex-grow-0"
        style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.125)',
        }}
      >
        <FormGroup>
          <Label for="contextSelector">
            Context selector
          </Label>
          <Field
            name="contextSelector" id="contextSelector"
            component={ Input }
            className="text-monospace"
          />
          <FormText color="muted">
            This CSS selector defines where nested components get to insert their content.
          </FormText>
        </FormGroup>
      </CardBody>
    </Form>
  </Card>
