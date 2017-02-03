import React from 'react'
import Card from '../../../../Card'
import Hint from '../../../../Hint'
import Grid from '../../../../Grid'
import { CardBlock, FormGroup, Col, Label } from 'reactstrap'
import { Control } from 'react-redux-form'

const gridCell = (cellData, rowIndex, colIndex, colName) => {
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
      <option value="click">click</option>
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
    />
  }
}

const headerCell = (title) =>
  <span
    style={{
      paddingLeft: '0.25rem',
    }}
  >
    { title }
  </span>

export default (props) =>
  <Card title="Responses" { ...props } wrapContent={false}>
    <Grid
      model=".responses"
      bodyCell={ gridCell }
      headerCell={ headerCell }
      columnWidths={ [30, 20, 20, 20] }
      columns={ ['label', 'type', 'target', 'filter'] }
      data={ props.data.rows }
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
              type="number"
              className="form-control" id="timeout"
              placeholder="Never"
            />
            <div className="input-group-addon text-muted">ms</div>
          </div>
        </Col>
      </FormGroup>
    </CardBlock>
  </Card>
