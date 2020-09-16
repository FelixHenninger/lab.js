import React from 'react'

import { Field, useFormikContext, getIn } from 'formik'
import { Row, Col,
  InputGroup, InputGroupAddon, InputGroupText,
  FormGroup, Label, FormText } from 'reactstrap'

import { CollapsingOptions } from './BaseOptions'
import Icon from '../../../../../../../Icon'
import { Input } from '../../../../../../../Form'

export const ExtraOptions = ({ name, type }) => {
  switch (type) {
    case 'number':
      return <>
        <FormGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrow-to-bottom" fallback="arrow-down" />
              </InputGroupText>
            </InputGroupAddon>
            <Field
              name={ `${ name }.attributes.min` }
              placeholder="No lower limit"
              component={ Input }
              className="text-monospace"
            />
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrow-to-top" fallback="arrow-up" />
              </InputGroupText>
            </InputGroupAddon>
            <Field
              name={ `${ name }.attributes.max` }
              placeholder="No upper limit"
              component={ Input }
              className="text-monospace"
            />
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="shoe-prints" />
              </InputGroupText>
            </InputGroupAddon>
            <Field
              name={ `${ name }.attributes.step` }
              placeholder="Default step (1)"
              component={ Input }
              className="text-monospace"
            />
          </InputGroup>
        </FormGroup>
      </>
    case 'date':
      return <>
        <FormGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrow-to-bottom" fallback="arrow-down" />
              </InputGroupText>
            </InputGroupAddon>
            <Field
              name={ `${ name }.attributes.min` }
              placeholder="No earliest date (yyyy-mm-dd)"
              component={ Input }
              className="text-monospace"
            />
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrow-to-top" fallback="arrow-up" />
              </InputGroupText>
            </InputGroupAddon>
            <Field
              name={ `${ name }.attributes.max` }
              placeholder="No latest date (yyyy-mm-dd)"
              component={ Input }
              className="text-monospace"
            />
          </InputGroup>
        </FormGroup>
      </>
    default:
      return null
  }
}

export default ({ name, index, type }) => {
  const { values } = useFormikContext()
  const attributes = getIn(values, `${ name }.attributes`)

  return <>
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
    >
      {
        type === 'input' && <>
          <FormGroup className="my-2">
            <Label for={ `page-item-${ index }-attrs-type` } className="mb-1">
              Data type
            </Label>
            <FormText color="muted" className="mb-2">
              Check input format, and restrict input
            </FormText>
            <Field
              name={ `${ name }.attributes.type` }
              index={ `page-item-${ index }-attrs-type` }
              as="select"
              className="form-control custom-select text-monospace"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="date">Date</option>
            </Field>
          </FormGroup>
          <ExtraOptions
            name={ name }
            type={ attributes && attributes.type }
          />
        </>
      }
    </CollapsingOptions>
  </>
}
