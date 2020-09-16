import React from 'react'
import { connect } from 'react-redux'
import { Field } from 'formik'

import Card from '../../../Card'
import { Input } from '../../../Form'
import { Table, DefaultRow, ButtonCell } from '../../../Form/table'
import Form from '../Form'
import Footer from './footer'

import { dataURItoIcon } from '../../../../logic/util/fileType'

const mapStateToProps = (state, { poolPath }) => {
  const file = state.files.files[poolPath]

  // If the file can't be found, something is wrong
  const icon = file
    ? dataURItoIcon(file.content)
    : 'file-exclamation'

  return { icon }
}

const FileIconCell = connect(mapStateToProps)(ButtonCell)

const FileRow = ({ index, name, data, arrayHelpers }) =>
  <DefaultRow
    index={ index } arrayHelpers={ arrayHelpers }
    leftColumn={ () => <FileIconCell poolPath={ data.poolPath } />}
  >
    <Field
      name={ `${ name }.localPath` }
      placeholder="filename"
      component={ Input }
      className="text-monospace"
    />
  </DefaultRow>

export default ({ id, data }) =>
  <Card title="Files" wrapContent={ false }>
    <Form
      id={ id } data={ data }
      keys={ ['files'] }
    >
      <Table
        name="files"
        row={ FileRow }
        footer={ Footer }
        className="no-header"
      />
    </Form>
  </Card>
