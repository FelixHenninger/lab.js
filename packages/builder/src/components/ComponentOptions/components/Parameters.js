import React from 'react'
import PropTypes from 'prop-types'

import { Col, Row, InputGroup } from 'reactstrap'
import { Control, actions } from 'react-redux-form'

import Card from '../../Card'
import Form from './Form'
import Grid from '../../Grid'

import { CellTypeSelector } from './Content/Loop/cells'

const DummyHeaderCell = () =>
  <div></div>

const BodyCell = ({ cellData, rowIndex, colIndex, colName },
  { formDispatch }) =>
  <Row>
    <Col xs="6" style={{ paddingRight: '0.25rem' }}>
      <Control.text
        model={ `.rows[${ rowIndex }][${ colIndex }]['name']` }
        className="form-control"
        placeholder="name"
        style={{
          fontFamily: 'Fira Mono',
        }}
        debounce={ 300 }
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
      keys={ ['parameters'] }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
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
      />
    </Form>
  </Card>
