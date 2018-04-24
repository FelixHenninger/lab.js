import React from 'react'
import { Control } from 'react-redux-form'
import { CardBody, FormGroup, Label, Input, FormText } from 'reactstrap'

import Form from '../Form'
import Card from '../../../Card'
import Editor from '../../../Editor'

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
      getDispatch={ dispatch => this.formDispatch = dispatch }
      className="flex-grow-1 d-flex flex-column"
    >
      <CardBody className="flex-grow-1 d-flex flex-column">
        <Control.textarea
          model=".context"
          component={ Editor }
          controlProps={{
            language: 'html',
          }}
          debounce={ 300 }
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
          <Control
            model=".contextSelector" id="contextSelector"
            component={ Input }
            style={{
              fontFamily: 'Fira Code',
            }}
          />
          <FormText color="muted">
            This CSS selector defines where nested components get to insert their content.
          </FormText>
        </FormGroup>
      </CardBody>
    </Form>
  </Card>
