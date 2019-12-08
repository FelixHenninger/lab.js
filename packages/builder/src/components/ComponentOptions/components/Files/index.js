import React, { Component } from 'react'
import { connect } from 'react-redux'
import Form from '../Form'
import { Control } from 'react-redux-form'

import Card from '../../../Card'
import Grid from '../../../Grid'
import ButtonCell from '../../../Grid/components/buttonCell'
import Footer from './footer'

import { dataURItoIcon } from '../../../../logic/util/fileType'

const GridCell = ({ cellData, rowIndex, colIndex, colName }) =>
  <Control.text
    model={ `.rows[${ rowIndex }][${ colIndex }]['localPath']` }
    className="form-control"
    placeholder="path"
    style={{
      fontFamily: 'Fira Mono',
    }}
    debounce={ 300 }
  />

const HeaderCell = () =>
  <>
    Path
  </>

const LeftColumn = ({ icon }) => {
  return <ButtonCell
    icon={ icon }
    onClick={ () => null }
  />
}

const mapStateToProps = (state, ownProps) => {
  const file = state.files.files[ownProps.rowData[0].poolPath]

  // If the file can't be found, something is wrong
  const icon = file
    ? dataURItoIcon(file.content)
    : 'file-exclamation'

  return { icon }
}

const ConnectedLeftColumn = connect(mapStateToProps)(LeftColumn)

export default class FileGrid extends Component {
  render() {
    const { id, data } = this.props

    return <Card title="Files" wrapContent={ false }>
      <Form
        id={ id }
        data={ data }
        keys={ ['files'] }
        getDispatch={ d => this.dispatch = d }
      >
        <Grid
          className="border-top-0"
          model=".files"
          BodyContent={ GridCell }
          HeaderContent={ HeaderCell }
          LeftColumn={ ConnectedLeftColumn }
          Footer={ Footer }
          columnWidths={ [ 90 ] }
          columns={ ['path'] }
          defaultRow={ [ { localPath: '', poolPath: '' }, ] }
          data={ data.files?.rows || [] }
          formDispatch={ action => this.dispatch(action) }
        />
      </Form>
    </Card>
  }
}
