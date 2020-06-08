import React, { useState } from 'react'

import { Row, Col, InputGroup, InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, CardBody, FormGroup } from 'reactstrap'
import { useField, Field } from 'formik'
import classnames from 'classnames'

import Card from '../../Card'
import Icon from '../../Icon'
import Form from './Form'
import { Input } from '../../Form'
import { Table, DefaultRow } from '../../Form/table'

const CellTypeSelector = ({ name, disabled }) => {
  const [, meta, helpers] = useField(name)
  const { value } = meta
  const { setValue } = helpers

  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <InputGroupButtonDropdown
      addonType="append"
      disabled={ disabled }
      isOpen={ dropdownOpen }
      toggle={ () => setDropdownOpen(!dropdownOpen) }
    >
      <DropdownToggle
        caret={ !disabled }
        disabled={ disabled }
        outline color="secondary"
        // Ensure that the right-hand side
        // always has rounded corners
        // (this didn't work if the button was disabled)
        className="rounded-right"
      >
        <Icon
          icon={{
            string: 'font',
            number: 'tachometer',
            boolean: 'adjust'
          }[value]}
          fixedWidth
        />
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem header>Data type</DropdownItem>
        <DropdownItem
          className={ classnames({
            'dropdown-item-active': value === 'string'
          }) }
          onClick={ () => setValue('string') }
        >
          Text <span className="text-muted">(categorical)</span>
        </DropdownItem>
        <DropdownItem
          className={ classnames({
            'dropdown-item-active': value === 'number'
          }) }
          onClick={ () => setValue('number') }
        >
          Numerical <span className="text-muted">(continuous)</span>
        </DropdownItem>
        <DropdownItem
          className={ classnames({
            'dropdown-item-active': value === 'boolean'
          }) }
          onClick={ () => setValue('boolean') }
        >
          Boolean <span className="text-muted">(binary)</span>
        </DropdownItem>
      </DropdownMenu>
    </InputGroupButtonDropdown>
  )
}

const TemplateRow = ({ index, name, arrayHelpers, readOnly }) =>
  <DefaultRow index={ index } arrayHelpers={ arrayHelpers }>
    <Row form>
      <Col xs="6">
        <Field
          name={ `${ name }.name` }
          component={ Input }
          placeholder="parameter"
          disabled={ readOnly }
          className="text-monospace"
        />
      </Col>
      <Col xs="6">
        <InputGroup>
          <Field
            name={ `${ name }.value` }
            component={ Input }
            placeholder="value"
            className="text-monospace"
          />
          <CellTypeSelector
            name={ `${ name }.type` }
          />
        </InputGroup>
      </Col>
    </Row>
  </DefaultRow>

export default ({ id, data }) =>
  <Card title="Template" wrapContent={false}>
    <Form
      id={ id } data={ data }
      keys={ ['notes', 'parameters'] }
    >
      <CardBody className="border-bottom">
        <FormGroup>
          <Field
            name="notes"
            component="textarea"
            rows="5"
            placeholder="Notes"
            className="form-control form-control-sm"
            style={{
              padding: '0.5rem 0.75rem',
            }}
          />
        </FormGroup>
      </CardBody>
      <Table
        name="parameters"
        defaultItem={{ name: '', value: '', type: 'string' }}
        row={ TemplateRow }
        className="no-header"
      />
    </Form>
  </Card>
