import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'
import Uploader from '../../../../../Uploader'
import { fromJSON } from '../../../../../../logic/io/load'

const ImportTab = ({ parent, index }, context) =>
  <Uploader
    accept="application/json"
    maxSize={ 1024 ** 2 }
    onUpload={
      fileContents => {
        try {
          // Parse file from JSON
          const state = fromJSON(fileContents)
          // Hydrate store from resulting object
          context.store.dispatch({
            type: 'IMPORT_COMPONENT',
            parent, index,
            id: state.components.root.children[0],
            source: state.components,
          })
          context.store.dispatch({
            type: 'HIDE_MODAL',
          })
        } catch(e) {
          // If things don't work out, let the user know
          alert('Couldn\'t load file, found error', e)
        }
      }
    }
  >
    <Button
      outline color="secondary"
      size="lg" block
    >
      <strong style={{ fontWeight: '500' }}>Import component</strong> from file
    </Button>
  </Uploader>


ImportTab.contextTypes = {
  store: PropTypes.object,
}

export default ImportTab
