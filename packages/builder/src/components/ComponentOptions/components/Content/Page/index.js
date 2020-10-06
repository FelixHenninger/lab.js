import React, { createContext, useState } from 'react'
import { Field, useFormikContext } from 'formik'
import { CardFooter, FormGroup, InputGroup, Label, Button,
  Row, Col, Collapse } from 'reactstrap'

import Card from '../../../../Card'
import Form from '../../Form'
import { Table, DefaultRow } from '../../../../Form/table'
import { Input } from '../../../../Form'
import Icon from '../../../../Icon'

import ItemOptions from './components/ItemOptions'
import { LeftColumn, RightColumn } from './components/Columns'
import GridFooter from './components/Footer'

// Grid contents ---------------------------------------------------------------

const ItemRow = ({ index, name, data, arrayHelpers, isLastItem }) =>
  <DefaultRow
    name={ name } index={ index }
    isLastItem={ isLastItem }
    arrayHelpers={ arrayHelpers }
    leftColumn={ LeftColumn }
    rightColumn={ RightColumn }
  >
    <ItemOptions
      name={ name }
      type={ data.type }
      data={ data }
      index={ index }
    />
  </DefaultRow>

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { values } = useFormikContext()

  return (
    <CardFooter className="px-0">
      <table className="table grid no-header table-borderless my-0">
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '90%' }} />
          <col style={{ width: '5%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td><div style={{ width: '40px' }} /></td>
            <td>
              <Row form>
                <Col>
                  <InputGroup>
                    <Field
                      name="submitButtonText"
                      component={ Input }
                      placeholder="Submit button text"
                      default="Continue →"
                      disabled={ values.submitButtonPosition === 'hidden' }
                    />
                    <Field
                      name="submitButtonPosition" id="submitButtonPosition"
                      className="form-control custom-select"
                      as="select"
                    >
                      <option value="right">
                        Show submit button
                      </option>
                      <option value="hidden">
                        Hide submit button
                      </option>
                    </Field>
                  </InputGroup>
                </Col>
              </Row>
              <Collapse isOpen={ isOpen }>
                <hr />
                <h3 className="h6">Presentation</h3>
                <FormGroup row className="mt-2">
                  <Label xs={ 3 } for="width">
                    Page width
                  </Label>
                  <Col xs={9}>
                    <InputGroup>
                      <Field
                        name="width" id="width"
                        as="select"
                        defaultValue="m"
                        className="form-control custom-select"
                      >
                        <option value="s">
                          Small
                        </option>
                        <option value="m">
                          Medium
                        </option>
                        <option value="l">
                          Large
                        </option>
                      </Field>
                    </InputGroup>
                  </Col>
                </FormGroup>
              </Collapse>
            </td>
            <td>
              <Button
                block outline color="muted"
                onClick={ () => setIsOpen(!isOpen) }
              >
                <Icon icon="cog" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </CardFooter>
  )
}

// State management ------------------------------------------------------------

export const ItemContext = createContext({})

const ItemContextProvider = (props) => {
  const [openItem, setOpenItem] = useState(undefined)

  return (
    <ItemContext.Provider
      value={{ openItem, setOpenItem }}
      { ...props }
    />
  )
}

// Main component --------------------------------------------------------------

export default ({ id, data }) =>
  <Card title="Content" wrapContent={false}>
    <Form
      id={ id } data={ data }
      keys={ [
        'items',
        'submitButtonText', 'submitButtonPosition',
        'width'
      ] }
      validateOnChange={ false }
    >
      <ItemContextProvider>
        <Table
          name="items"
          defaultItem={{ type: '' }}
          row={ ItemRow }
          footer={ GridFooter }
          className="no-header mb-0"
        />
      </ItemContextProvider>
      <Footer />
    </Form>
  </Card>
