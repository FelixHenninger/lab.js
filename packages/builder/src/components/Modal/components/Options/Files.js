import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Table, Button } from 'reactstrap'
import { FileTableHeader, FileTableBody, FileTableColGroup } from '../../../FileTable'
import Icon from '../../../Icon'
import Uploader from '../../../Uploader'

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
              (fileContents, file) => {
                try {
                  store.dispatch({
                    type: 'ADD_FILE',
                    file: `static/${ file.name }`,
                    data: {
                      content: fileContents,
                      source: 'embedded-global',
                    }
                  })
                } catch(e) {
                  alert('Couldn\'t add file, found error', e)
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
