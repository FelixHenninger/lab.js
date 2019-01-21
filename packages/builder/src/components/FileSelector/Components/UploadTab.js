import React from 'react'

import Uploader from '../../Uploader'
import Icon from '../../Icon'

export default ({ handleUpload, accept='' }) =>
  <Uploader
    accept={ accept }
    decodeAs="dataURL"
    onUpload={ handleUpload }
  >
    <div
      className="btn btn-outline-secondary btn-block text-center p-5"
    >
      <Icon
        icon="file-upload"
        className="d-block text-muted p-3"
        style={{
          fontSize: '3.5rem',
        }}
      />
      <small className="text-muted">
        Please <strong>drop a file</strong> here to add,<br />
        or <strong>click to choose</strong> one from your computer
      </small>
    </div>
  </Uploader>
