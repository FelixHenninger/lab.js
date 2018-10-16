import React from 'react'
import PropTypes from 'prop-types'
import Uploader from '../../../../../Uploader'
import { fromJSON } from '../../../../../../logic/io/load'

export const importComponent = (parent, index, state, store) => {
  // Hydrate store from resulting object
  if (state.components.root.children.length === 1) {
    // If the root component has only a single child,
    // import that.
    store.dispatch({
      type: 'IMPORT_COMPONENT',
      parent, index,
      id: state.components.root.children[0],
      source: state.components,
    })
  } else {
    // If the root component has multiple descendants,
    // import them as a sequence

    // Remove metadata collection plugin
    // (which is automatically added to every study root)
    state.components.root.plugins =
      state.components.root.plugins.filter(
        x => x.type !== 'lab.plugins.Metadata'
      )

    // Rename task from metadata
    state.components.root.title =
      state.components.root.metadata.title || 'Unnamed task'

    store.dispatch({
      type: 'IMPORT_COMPONENT',
      parent, index,
      id: 'root',
      source: state.components,
    })
  }

  // Merge files
  store.dispatch({
    type: 'MERGE_FILES',
    files: state.files.files
  })

  // Open component options
  store.dispatch({
    type: 'SHOW_COMPONENT_DETAIL',
    id: store.getState().components[parent].children[index],
  })

  store.dispatch({
    type: 'HIDE_MODAL',
  })
}

const ImportTab = ({ parent, index }, { store }) =>
  <Uploader
    accept="application/json"
    maxSize={ 55 * 10**6 } // 55 MB
    onUpload={
      fileContents => {
        try {
          // Parse file from JSON
          const data = fromJSON(fileContents)
          importComponent(parent, index, data, store)
        } catch(e) {
          // If things don't work out, let the user know
          alert('Couldn\'t load file, found error', e)
        }
      }
    }
  >
    <button className="btn btn-outline-secondary btn-lg btn-block">
      <strong>Import component</strong> from file
    </button>
  </Uploader>


ImportTab.contextTypes = {
  store: PropTypes.object,
}

export default ImportTab
