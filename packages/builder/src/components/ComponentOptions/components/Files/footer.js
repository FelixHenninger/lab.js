import React from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'
import { actions } from 'react-redux-form'

import Uploader from '../../../Uploader'
import Icon from '../../../Icon'
import { addEmbeddedFile } from '../../../../logic/util/files'

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
            (fileContent, file) => {
              // Pick file
              try {
                const { path } = addEmbeddedFile(store, fileContent, file)

                // Add file to local component
                // (TODO: yes, this is named awkwardly)
                const newRow = [{
                  path: file.name,
                  file: path,
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
