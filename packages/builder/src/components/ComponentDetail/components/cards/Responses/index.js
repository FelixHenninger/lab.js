import React from 'react'
import Card from '../../../../Card'
import Hint from '../../../../Hint'

import Grid from '../../../../Grid'
import { CardBlock, FormGroup, Col, Label } from 'reactstrap'

import { Control } from 'react-redux-form'

const GridCell = ({ cellData, rowIndex, colIndex, colName }) => {
  if (colIndex === 1) {
    return <Control.select
      model={ `.rows[${ rowIndex }][${ colIndex }]` }
      className="form-control custom-select"
      style={{
        fontFamily: 'Fira Mono',
        color: cellData === '' ? '#999' : 'inherit',
      }}
    >
      <option value="">undefined</option>
      <option value="keypress">keypress</option>
      <option value="keydown">keydown</option>
      <option value="keyup">keyup</option>
      <option value="click">click</option>
      <option value="mousedown">mousedown</option>
      <option value="mouseup">mouseup</option>
    </Control.select>
  } else {
    const placeholder = colIndex === 2 ? 'window' : ''
    return <Control.text
      model={ `.rows[${ rowIndex }][${ colIndex }]` }
      placeholder={ placeholder }
      className="form-control"
      style={{
        fontFamily: 'Fira Mono',
      }}
      debounce={ 300 }
    />
  }
}

const HeaderCell = ({ columnData }) =>
  <span
    style={{
      paddingLeft: '0.25rem',
    }}
  >
    { columnData }
  </span>

export default (props) =>
  <Card title="Responses" { ...props } wrapContent={false}>
    <Grid
      model=".responses"
      data={ props.data.rows }
      columns={ ['label', 'type', 'target', 'filter'] }
      columnWidths={ [30, 20, 20, 20] }
      HeaderContent={ HeaderCell }
      BodyContent={ GridCell }
      formDispatch={ props.formDispatch }
    />
    <CardBlock>
      <FormGroup row>
        <Col xs="2">
          <Label for="correctResponse" xs={2}>Correct</Label>
          <Hint
            title="Correct response"
            className="pull-right" style={{ paddingTop: '0.5rem' }}
          >
            Label of the response classified as correct.
          </Hint>
        </Col>
        <Col xs="10">
          <Control
            model=".correctResponse"
            type="text"
            className="form-control" id="correctResponse"
            placeholder="Undefined"
            debounce={ 300 }
          />
        </Col>
      </FormGroup>
      <FormGroup row>
        <Col xs="2">
          <Label for="timeout" xs={2}>Timeout</Label>
          <Hint
            title="Timeout"
            className="pull-right" style={{ paddingTop: '0.5rem' }}
          >
            End component automatically after this interval
          </Hint>
        </Col>
        <Col xs="10">
          <div className="input-group">
            <Control
              model=".timeout"
              pattern="(\d+)|(\$\{.*\})" // Accept number or placeholder
              className="form-control" id="timeout"
              placeholder="Never"
              debounce={ 300 }
            />
            <div className="input-group-addon text-muted">ms</div>
          </div>
        </Col>
      </FormGroup>
    </CardBlock>
  </Card>
