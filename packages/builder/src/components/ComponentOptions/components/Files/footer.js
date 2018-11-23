import React from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'
import { actions } from 'react-redux-form'
import sha256 from 'hash.js/lib/hash/sha/256'

import Uploader from '../../../Uploader'
import Icon from '../../../Icon'

const Footer = (
  { columns, data, model },
  { store, formDispatch }
) =>
  <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <Uploader
          decodeAs="dataURL"
          maxSize={ 1 * 10**6 } // 1 MB
          onUpload={
            (fileContents, file) => {
              // Pick file
              try {
                // Compute (user-changable) file path and
                // (internal) file name
                const path = file.name
                const fileHash = sha256().update(fileContents).digest('hex')
                const fileExtension = file.name.split('.').pop()
                const filePath = `embedded/${ fileHash }.${ fileExtension }`

                // Add file to global file repository
                store.dispatch({
                  type: 'ADD_FILE',
                  file: filePath,
                  data: {
                    content: fileContents
                  }
                })

                // Add file to local component
                const newRow = [{
                  path, file: filePath,
                }]

                formDispatch(
                  actions.change(
                    `local${ model }.rows`,
                    [...data, newRow]
                  )
                )
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

Footer.contextTypes = {
  formDispatch: PropTypes.func,
  store: PropTypes.object,
}

export default Footer
