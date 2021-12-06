import React, { useMemo } from 'react'
import { Card as RawCard, CardFooter, Row, Col } from 'reactstrap'
import { Field, useField } from 'formik'

import Form from '../Form'
import { Input } from '../../../Form'
import { Table, DefaultRow } from '../../../Form/table'
import Card from '../../../Card'
import Editor from '../../../Editor'
import HookDropdown from './HookDropdown'

import { adaptiveFunction } from '../../../../logic/util/async'

import './style.css'

const WrappedEditor = ({ name }) => {
  const [{ value }, , { setValue }] = useField(name)

  // TODO: Throttle error checking
  const errors = useMemo(
    () => parsingErrors(value),
    [value]
  )

  return (
    <RawCard
      outline
      color={ errors ? 'warning' : 'secondary' }
      className="editor-field"
    >
      <Editor
        height={600}
        language="javascript"
        value={ value }
        onChange={ value => setValue(value) }
      />
      {
        errors
          ? <CardFooter>
              <strong>{ errors && errors.name }:</strong>&nbsp;
              { errors && errors.message }
            </CardFooter>
          : null
      }
    </RawCard>
  )
}

const parsingErrors = (code) => {
  // TODO: Ideally, the error checking performed here
  //   would be done by a linter. Sadly, eslint doesn't
  //   work in the browser directly, but there appear
  //   to be some workarounds that, however, require
  //   a custom build.
  try {
    adaptiveFunction(code)
    return null
  } catch (e) {
    return {
      name: e.name,
      message: e.message,
    }
  }
}

const GridRow = ({ index, name, arrayHelpers }) =>
  <DefaultRow index={ index } name={ name } arrayHelpers={ arrayHelpers }>
    <Row form>
      <Col xs="6">
        <Field
          name={ `${ name }.title` }
          component={ Input }
          placeholder="title"
          className="text-monospace"
        />
      </Col>
      <Col xs="6">
        <HookDropdown name={ `${ name }.message` } />
      </Col>
    </Row>
    <WrappedEditor
      name={ `${ name }.code` }
    />
  </DefaultRow>

export default ({ id, data }) =>
  <Card title="Scripts" wrapContent={ false }>
    <Form
      id={ id } data={ data }
      keys={ ['hooks'] }
    >
      <Table
        name="hooks"
        defaultItem={{ title: '', message: '', code: '' }}
        row={ GridRow }
        className="no-header"
      />
    </Form>
  </Card>
