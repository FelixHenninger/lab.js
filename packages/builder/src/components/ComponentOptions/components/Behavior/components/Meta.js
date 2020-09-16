import React from 'react'

import { Field, useFormikContext } from 'formik'
import { FormGroup, Col, Label,
  InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'

import Card from '../../../../Card'
import Hint from '../../../../Hint'
import { Input, CustomInput } from '../../../../Form'

export default () => {
  const { values } = useFormikContext()

  return (
    <Card title="Meta" className="mt-4">
      <FormGroup row>
        <Label for="skip" xs="2">
          Skip
          <Hint
            title="Skip"
            className="float-right"
          >
            <p className="font-weight-bold">
              Don't run the component during the study.
            </p>
            <p className="text-muted">
              This will cause any component to be prepared, but not run.
            </p>
          </Hint>
        </Label>
        <Col xs="10">
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Field
                  name="skip" id="skip"
                  component={ CustomInput }
                  type="checkbox"
                />
              </InputGroupText>
            </InputGroupAddon>
            <Field
              name="skipCondition"
              component={ Input }
              className="text-monospace"
              // eslint-disable-next-line no-template-curly-in-string
              placeholder="${ optional condition }"
              disabled={ values.skip === true }
            />
          </InputGroup>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="tardy" xs="2">
          Tardy
          <Hint
            title="Tardiness"
            className="float-right"
          >
            <p className="font-weight-bold">
              Prepare the component at the last possible moment, just before it is run.
            </p>
            <p className="text-muted">
              This is useful if the component depends on information that becomes available only during the study, for example if a screen's content depends on participant behavior.
            </p>
            <p className="text-muted">
              Ordinarily, a component is prepared when the page is loaded.
            </p>
          </Hint>
        </Label>
        <Col xs="10" className="pt-2">
          <Field
            name="tardy" id="tardy"
            component={ CustomInput }
            type="checkbox"
          />
        </Col>
      </FormGroup>
    </Card>
  )
}
