import React from 'react'

import { Control } from 'react-redux-form'
import { FormGroup, Col, Label,
  Input, CustomInput,
  InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'

import Card from '../../../../Card'
import Hint from '../../../../Hint'

export default ({ data }) =>
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
              <Control.checkbox
                model=".skip"
                component={ CustomInput }
                controlProps={{
                  addon: 'true',
                  id: 'skip',
                  type: 'checkbox'
                }}
              />
            </InputGroupText>
          </InputGroupAddon>
          <Control
            model=".skipCondition"
            component={ Input }
            controlProps={{
              disabled: data.skip
            }}
            // eslint-disable-next-line no-template-curly-in-string
            placeholder="${ optional condition }"
            type="text"
            id="skipCondition"
            style={{
              fontFamily: 'Fira Mono',
            }}
            debounce={ 300 }
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
        <Control.checkbox
          model=".tardy"
          component={ CustomInput }
          controlProps={{
            id: 'tardy',
            type: 'checkbox',
          }}
        />
      </Col>
    </FormGroup>
  </Card>
