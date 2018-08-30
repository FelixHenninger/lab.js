import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Table, Button } from 'reactstrap'
import { FileTable } from '../../../FileTable'
import Icon from '../../../Icon'
import Uploader from '../../../Uploader'

const Files = ({ files }, { store }) =>
  // We borrow styles from the grid component,
  // please make global adjustments there.
  // (TODO: check whether the border can be generalized)
  <Table className="grid" style={{ borderBottom: '2px solid #eceeef' }}>
    <colgroup>
      <col style={{ width: '6%' }} />
      <col style={{ width: '60%' }} />
      <col style={{ width: '18%' }} />
      <col style={{ width: '6%' }} />
    </colgroup>
    <thead>
      <tr>
        <th></th>
        <th>Filename</th>
        <th className="text-right">
          Size <span className="text-muted font-weight-normal">[KB]</span>
        </th>
        <th></th>
      </tr>
    </thead>
    <FileTable />
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
                      content: fileContents
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
