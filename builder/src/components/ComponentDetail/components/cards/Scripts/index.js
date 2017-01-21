import React from 'react'
import Card from '../../../../Card'
import Grid from '../../../../Grid'
import Editor from '../../../../Editor'
import { Card as RawCard, CardFooter, Row, Col } from 'reactstrap'
import { Control } from 'react-redux-form'

import './style.css'

const wrappedEditor = props =>
  <RawCard
    outline
    color={ props.errors.syntax === false ? 'secondary' : 'warning'}
    className="editor-field"
  >
    <Editor
      height={200}
      language="javascript"
      value={ props.value }
      onChange={ props.onChange }
    />
    {
      props.errors.syntax === false
        ? null
        : <CardFooter>
            <strong>{ props.errors.syntax && props.errors.syntax.name }:</strong>&nbsp;
            { props.errors.syntax && props.errors.syntax.message }
          </CardFooter>
    }
  </RawCard>

const parsingErrors = (code) => {
  // TODO: Ideally, the error checking performed here
  //   would be done by a linter. Sadly, eslint doesn't
  //   work in the browser directly, but there appear
  //   to be some workarounds that, however, require
  //   a custom build.
  try {
    new Function(code) // eslint-disable-line no-new-func
    return false
  } catch (e) {
    return {
      name: e.name,
      message: e.message,
    }
  }
}

const headerCell = props =>
  <div></div>

const gridCell = (cellData, rowIndex, colIndex, colName, formDispatch) =>
  <div>
    <Row>
      <Col xs="6" style={{ paddingRight: '0.25rem' }}>
        <Control.text
          model={ `.rows[${ rowIndex }][${ colIndex }]['title']` }
          className="form-control"
          placeholder="title"
          style={{
            fontFamily: 'Fira Mono',
          }}
        />
      </Col>
      <Col xs="6" style={{ paddingLeft: '0.25rem' }}>
        <Control.select
          model={ `.rows[${ rowIndex }][${ colIndex }].message` }
          className="form-control custom-select"
          style={{
            fontFamily: 'Fira Mono',
            color: cellData.message === '' ? '#999' : 'inherit',
          }}
        >
          <option value="">event</option>
          <option value="before:prepare">before:prepare</option>
          <option value="prepare">prepare</option>
          <option value="run">run</option>
          <option value="end">end</option>
          <option value="after:end">after:end</option>
        </Control.select>
      </Col>
    </Row>
    <Control.textarea
      model={ `.rows[${ rowIndex }][${ colIndex }].code` }
      component={ wrappedEditor }
      errors={{
        // TODO: Enable proper validation and show errors
        syntax: (value) => parsingErrors(value),
      }}
      mapProps={{
        errors: props => props.fieldValue.errors,
      }}
    />
  </div>

export default (props) =>
  <Card title="Scripts" open={false} { ...props } wrapContent={false}>
    <Grid
      model=".messageHandlers"
      bodyCell={ gridCell }
      headerCell={ headerCell }
      showHeader={ false }
      columnWidths={ [ 90 ] }
      columns={ ['label'] }
      defaultRow={ [ { title: '', message: '', code: '' }, ] }
      data={ props.data.rows }
      formDispatch={ props.formDispatch }
    />
  </Card>
