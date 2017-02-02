import React from 'react'
import Card from '../../../../../Card'
import Grid from '../../../../../Grid'
import { CardBlock, FormGroup, Col, Label } from 'reactstrap'
import { Control } from 'react-redux-form'

const gridCell = (cellData, rowIndex, colIndex, colName) =>
  <Control.text
    model={ `.rows[${ rowIndex }][${ colIndex }]` }
    className="form-control"
    style={{
      fontFamily: 'Fira Mono',
    }}
  />

const headerCell = (title, index) =>
  <div>
    <Control.text
      model={ `.columns[${ index }['name']]` }
      placeholder={ `parameter${ index }` }
      className="form-control"
      style={{
        fontFamily: 'Fira Mono',
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
      }}
    />
    <Control.select
      model={ `.columns[${ index }]['type']` }
      className="form-control form-control-sm custom-select"
      style={{
        fontFamily: 'Fira Mono',
        position: 'relative',
        top: '-1px',
        paddingLeft: '0.5rem',
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
      }}
    >
      <option value="string">text</option>
      <option value="number">number</option>
    </Control.select>
  </div>

export default (props) =>
  <Card title="Loop" { ...props } wrapContent={false}>
    <Grid
      model=".templateParameters"
      addColumns
      defaultColumn={ { name: '', type: 'string' } }
      bodyCell={ gridCell }
      headerCell={ headerCell }
      columns={ props.data.columns }
      data={ props.data.rows }
      formDispatch={ props.formDispatch }
    />
    <CardBlock>
      <Col xs="2" style={{ paddingLeft: '0' }}>Order</Col>
      <Col xs="6">
        <FormGroup check>
          <Label check>
            <Control.checkbox
              model=".shuffle"
              className="form-check-input"
            />
            &thinsp;
            Shuffle
          </Label>
        </FormGroup>
      </Col>
    </CardBlock>
  </Card>
