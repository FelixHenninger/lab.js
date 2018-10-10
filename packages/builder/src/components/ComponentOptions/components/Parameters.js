import React from 'react'
import PropTypes from 'prop-types'

import { Col, Row, InputGroup, Input, CardBody, FormGroup } from 'reactstrap'
import { Control, actions } from 'react-redux-form'

import Card from '../../Card'
import Form from './Form'
import Grid from '../../Grid'

import { CellTypeSelector } from './Content/Loop/cells'

const DummyHeaderCell = () =>
  <div></div>

const BodyCell = ({ cellData, rowIndex, colIndex, colName, readOnly },
  { formDispatch }) =>
  <Row>
    <Col xs="6" style={{ paddingRight: '0.25rem' }}>
      <Control.text
        model={ `.rows[${ rowIndex }][${ colIndex }]['name']` }
        placeholder="name"
        style={{
          fontFamily: 'Fira Mono',
        }}
        debounce={ 300 }
        component={ Input }
        controlProps={{
          disabled: readOnly,
        }}
      />
    </Col>
    <Col xs="6" style={{ paddingLeft: '0.25rem' }}>
      <InputGroup>
        <Control.text
          model={ `.rows[${ rowIndex }][${ colIndex }]['value']` }
          className="form-control"
          placeholder="value"
          style={{
            fontFamily: 'Fira Mono',
          }}
          debounce={ 300 }
        />
        <CellTypeSelector
          type={ cellData.type }
          setType={
            value => formDispatch(
              actions.change(
                `local.parameters.rows[${ rowIndex }][${ colIndex }]['type']`,
                value
              )
            )
          }
          disabled={ readOnly }
        />
      </InputGroup>
    </Col>
  </Row>

BodyCell.contextTypes = {
  formDispatch: PropTypes.func,
}

export default ({ id, data }) =>
  <Card title="Parameters" wrapContent={false}>
    <Form
      id={ id }
      data={ data }
      keys={ ['notes', 'parameters'] }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <CardBody className="border-bottom">
        <FormGroup>
          <Control.textarea
            model=".notes"
            className="form-control form-control-sm"
            placeholder="Notes"
            rows="5"
            style={{
              padding: '0.5rem 0.75rem',
            }}
            debounce={ 300 }
          />
        </FormGroup>
      </CardBody>
      <Grid
        model=".parameters"
        HeaderContent={ DummyHeaderCell }
        showHeader={ false }
        defaultRow={ [ { name: '', value: '', type: 'string' } ] }
        BodyContent={ BodyCell }
        columns={ ['Parameters'] }
        // TODO: Revise once nullish coalescing
        // is available: grid should handle undefined data
        data={ data.parameters ? data.parameters.rows : [] }
        formDispatch={ action => this.formDispatch(action) }
        // Parameter names are read-only in template mode
        readOnly={ data._template }
        cellProps={{
          readOnly: data._template
        }}
      />
    </Form>
  </Card>
