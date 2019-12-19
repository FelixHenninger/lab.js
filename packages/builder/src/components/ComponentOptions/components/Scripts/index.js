import React, { Component } from 'react'
import { Card as RawCard, CardFooter, Row, Col } from 'reactstrap'
import { Control } from 'react-redux-form'

import Form from '../Form'
import Card from '../../../Card'
import Grid from '../../../Grid'
import Editor from '../../../Editor'

import { adaptiveFunction } from '../../../../logic/util/async'

import './style.css'

const wrappedEditor = props =>
  <RawCard
    outline
    color={ props.errors.syntax === false ? 'secondary' : 'warning'}
    className="editor-field"
  >
    <Editor
      height={600}
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
    adaptiveFunction(code)
    return false
  } catch (e) {
    return {
      name: e.name,
      message: e.message,
    }
  }
}

const HeaderCell = () => null

const GridCell = ({ cellData, rowIndex, colIndex }) =>
  <>
    <Row form>
      <Col xs="6">
        <Control.text
          model={ `.rows[${ rowIndex }][${ colIndex }]['title']` }
          className="form-control"
          placeholder="title"
          style={{
            fontFamily: 'Fira Mono',
          }}
          debounce={ 300 }
        />
      </Col>
      <Col xs="6">
        <Control.select
          model={ `.rows[${ rowIndex }][${ colIndex }].message` }
          className="form-control custom-select"
          style={{
            fontFamily: 'Fira Mono',
            color: cellData.message === '' ? 'var(--gray)' : 'inherit',
          }}
        >
          <option value="">event</option>
          <option value="before:prepare">before:prepare</option>
          <option value="after:prepare">after:prepare</option>
          <option value="run">run</option>
          <option value="end">end</option>
          <option value="after:end">after:end</option>
          <option value="commit">commit</option>
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
      debounce={ 300 }
    />
  </>

export default class extends Component {
  constructor(props) {
    super(props)
    this.formDispatch = () => console.log('invalid dispatch')
  }

  render() {
    const { id, data } = this.props

    return <Card title="Scripts" wrapContent={false}>
      <Form
        id={ id }
        data={ data }
        keys={ ['messageHandlers'] }
        getDispatch={ dispatch => this.formDispatch = dispatch }
      >
        <Grid
          model=".messageHandlers"
          HeaderContent={ HeaderCell }
          BodyContent={ GridCell }
          showHeader={ false }
          columnWidths={ [ 90 ] }
          columns={ ['label'] }
          defaultRow={ [ { title: '', message: '', code: '' }, ] }
          data={ data.messageHandlers?.rows || [] }
          formDispatch={ action => this.formDispatch(action) }
        />
      </Form>
    </Card>
  }
}
