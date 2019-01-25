import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Table, Button } from 'reactstrap'
import { FileTableHeader, FileTableBody, FileTableColGroup } from '../../../FileTable'
import Icon from '../../../Icon'
import Uploader from '../../../Uploader'
import { addFiles } from '../../../../logic/util/files'

const Files = ({ files }, { store }) =>
  // We borrow styles from the grid component,
  // please make global adjustments there.
  // (TODO: check whether the border can be generalized)
  <Table className="grid border-top-0" style={{ borderBottom: '2px solid #eceeef' }}>
    <FileTableColGroup />
    <FileTableHeader />
    <FileTableBody />
    <tfoot>
      <tr>
        <td />
        <td colSpan="2">
          <Uploader
            decodeAs="dataURL"
            maxSize={ 1 * 10**6 } // 1 MB
            onUpload={
              files => {
                try {
                  addFiles(store, files.map(([content, file]) => ({
                    poolPath: `static/${ file.name }`,
                    data: {
                      content: content,
                      source: 'embedded-global',
                    }
                  })))
                } catch(e) {
                  console.log('Error while adding file', e)
                  alert('Encountered error while adding file:', e)
                }
              }
            }
          >
            <Button
              size="sm" block
              outline color="muted"
              className="hover-target"
            >
              <Icon icon="plus" />
            </Button>
          </Uploader>
        </td>
        <td />
      </tr>
    </tfoot>
  </Table>

// Redux integration
const mapStateToProps = (state) => ({
  files: state.files.files
})

Files.contextTypes = {
  store: PropTypes.object,
}

export default connect(mapStateToProps)(Files)
