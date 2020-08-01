import React, { useContext } from 'react'

import { Field } from 'formik'
import { FormGroup, Label, FormText,
  Row, Col, Collapse } from 'reactstrap'

import { Input, CustomInput } from '../../../../../../../Form'

import { ItemContext } from '../../../index'

export const BaseOptions = ({ name, index, children,
  validation, shuffle=false, borderTop=true }) =>
  <>
    { children && borderTop && <hr /> }
    { children }
    {
      shuffle && <>
        <hr />
        Display
        <FormGroup className="my-2">
          <FormText color="muted" className="mb-2">
            Randomize item order
          </FormText>
          <Field
            name={ `${ name }.shuffle` } id={ `item-shuffle-${ index }` }
            component={ CustomInput }
            type="checkbox"
            label="Shuffle items"
          />
        </FormGroup>
      </>
    }
    <hr />
    <FormGroup className="my-2">
      <Label for={ `page-item-${ index }-help` } className="mb-0">
        Help &amp; further instructions
      </Label>
      <FormText color="muted">
        Tell your participants more about the question.
      </FormText>
      <Field
        name={ `${ name }.help` } id={ `page-item-${ index }-help` }
        component={ Input }
        type="textarea"
        bsSize="sm"
        rows="3"
        className="mt-2 text-muted"
      />
    </FormGroup>
    <hr />
    <FormGroup className="my-2">
      <Label for={ `page-item-${ index }-name` } className="mb-0">
        Name
      </Label>
      <FormText color="muted" className="mb-2">
        The column in which to save the data
      </FormText>
      <Field
        name={ `${ name }.name` } id={ `page-item-${ index }-name` }
        component={ Input }
        className="text-monospace"
        placeholder="(auto-generate from question)"
      />
    </FormGroup>
    <hr />
    Validation
    <FormGroup className="my-2">
      <FormText color="muted" className="mb-2">
        Checks to run before accepting data
      </FormText>
      <Field
        name={ `${ name }.required` } id={ `item-required-${ index }` }
        component={ CustomInput }
        type="checkbox"
        label="Require answer"
      />
    </FormGroup>
    { validation }
  </>

export const CollapsingOptions = ({ name, index, ...props }) => {
  const { openItem } = useContext(ItemContext)

  return (
    <Row form>
      <Col>
        <Collapse isOpen={ openItem === index }>
          <BaseOptions
            name={ name }
            index={ index }
            { ...props }
          />
        </Collapse>
      </Col>
    </Row>
  )
}
