import React from 'react'
import { Control } from 'react-redux-form'
import { FormGroup, Input, CustomInput, Label, FormText } from 'reactstrap'

export const BaseOptions = ({ rowIndex }) =>
  <>
    <hr />
    <FormGroup className="my-2">
      <Label for={ `page-item-${ rowIndex }-help` } className="mb-0">
        Help &amp; further instructions
      </Label>
      <FormText color="muted">
        Tell your participants more about the question.
      </FormText>
      <Control.textarea
        model=".help"
        component={ Input }
        controlProps={{
          id: `page-item-${ rowIndex }-help`,
          type: 'textarea', bsSize: 'sm',
          rows: 3
        }}
        className="mt-2 text-muted"
        debounce={ 300 }
      />
    </FormGroup>
    <hr />
    <FormGroup className="my-2">
      <Label for={ `page-item-${ rowIndex }-name` } className="mb-0">
        Name
      </Label>
      <FormText color="muted" className="mb-2">
        The column in which to save the data
      </FormText>
      <Control
        model=".name"
        placeholder={ '(auto-generate from question)' }
        component={ Input }
        className="font-weight-bold"
        controlProps={{
          id: `page-item-${ rowIndex }-name`,
          style: {
            fontFamily: 'Fira Mono',
          }
        }}
        debounce={ 300 }
      />
    </FormGroup>
    <hr />
    <FormGroup className="my-2">
      Validation
      <FormText color="muted" className="mb-2">
        Checks to run before accepting data
      </FormText>
      <Control.checkbox
        model=".required"
        component={ CustomInput }
        controlProps={{
          type: 'checkbox',
          label: 'Require answer',
          id: `item-required-${ rowIndex }`,
          style: {
            fontFamily: 'Fira Mono',
          }
        }}
        debounce={ 300 }
      />
    </FormGroup>
  </>
