import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Table, Button } from 'reactstrap'
import Icon from '../../../Icon'
import Uploader from '../../../Uploader'

import { sortBy } from 'lodash'
import { mimeFromDataURI } from '../../../../logic/util/dataURI'

const mimeToIcon = mime => {
  const [family, ] = mime.split('/')

  const mimeFamilies = [
    'image', 'audio', 'video'
  ]
  const codeMimes = [
    'text/html', 'text/css',
    'application/javascript', 'application-json'
  ]

  if (mimeFamilies.includes(family)) {
    return 'file-' + family
  } else if (codeMimes.includes(mime)) {
    return 'file-code'
  } else if (mime === 'text/plain') {
    return 'file-alt'
  } else {
    return 'file'
  }
}

const dataURItoIcon = uri =>
  mimeToIcon(mimeFromDataURI(uri))

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
    <tbody>
      {
        sortBy(Object.entries(files), ([k, v]) => k)
          .filter(([k, v]) => !v.permanent)
          .map(([k, v]) =>
            <tr key={ k }>
              <td>
                <div
                  className="text-muted text-center"
                  style={{
                    padding: '0.375rem 0.75rem',
                    border: '1px solid transparent',
                    lineHeight: '1.5',
                  }}
                >
                  <Icon
                    icon={ dataURItoIcon(v.content) }
                    className="fa-fw"
                    style={{
                      color: '#ced4da',
                      position: 'relative',
                      top: '1px',
                    }}
                  />
                </div>
              </td>
              <td className="text-monospace">
                <div style={{ padding: "0.55rem 0 0.2rem" }}>
                  { k }
                </div>
              </td>
              <td className="text-monospace text-right">
                <div style={{ padding: "0.55rem 0 0.2rem" }}>
                {
                  // base64 encoding inflates the file, storing 6 bits in every
                  // 8-bit character; the initial data URI indicator and the
                  // trailing equal sign don't count toward the file size.
                  //
                  // TODO: Even with all of these corrections, this is an
                  // approximation, and will differ from OS file managers.
                  // Corrections are welcome!
                  Math.ceil(
                    0.75 * (v.content.length - v.content.indexOf(',') - 1)
                    / 1000
                  )
                }
                </div>
              </td>
              <td>
                <Button
                  block
                  outline color="muted"
                  onClick={ () => store.dispatch({
                    type: 'DELETE_FILE',
                    file: k,
                  }) }
                >
                  <Icon
                    icon="trash"
                    className="fa-fw"
                  />
                </Button>
              </td>
            </tr>
          )
      }
    </tbody>
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
                  console.log('fileContents', fileContents)
                  console.log('file.name', file.name)
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
