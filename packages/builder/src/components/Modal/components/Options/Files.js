import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Table, Button } from 'reactstrap'
import { FileTableHeader, FileTableBody, FileTableColGroup } from '../../../FileTable'
import Icon from '../../../Icon'
import Uploader from '../../../Uploader'
import { addFiles } from '../../../../logic/util/files'

import FileStorage from '../../../FileStorageIndicator'

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

const ConnectedFiles = connect(mapStateToProps)(Files)

export default () =>
  <>
    <h4 className="mt-1">
      Storage in use
    </h4>
    <FileStorage />
    <small className="text-muted d-block mt-2">While storage is not strictly limited, we strongly recommend that studies use substantially less than 50 MB overall, and ideally below 20MB. This is not because of technical limitations but to reduce loading time and network traffic. If larger media are required, for example videos, these should be hosted outside of the study.</small>

    <hr />
    <h5 className="h5 mt-1">
      Study-wide static files
    </h5>
    <p className="text-muted">The following files are available study-wide from the <code>static</code> directory.</p>
    <ConnectedFiles />
  </>
