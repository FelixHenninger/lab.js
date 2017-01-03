import React from 'react'
import { ButtonGroup, Button } from 'reactstrap'

import PreviewButton from './components/PreviewButton'
import UploadButton from './components/UploadButton'
import { fromJSON } from '../../logic/load'
import { stateToDownload } from '../../logic/export'
import './styles.css'

const Toolbar = (props, context) =>
  <div className="toolbar">
    <ButtonGroup>
      <PreviewButton />
    </ButtonGroup>{' '}
    <ButtonGroup>
      <Button
        onClick={() => {
          if (window.confirm('Do you really want to reset the study?')) {
            context.store.dispatch({ type: 'RESET_STATE' })
            context.store.dispatch({ type: 'SHOW_COMPONENT_DETAIL', id: null })
          }
        }}
      >
        <i className="fa fa-file-o" aria-hidden="true"></i>
      </Button>
      <UploadButton
        accept="application/json"
        maxSize={ 1024 ** 2 }
        onUpload={
          // TODO: This smells like it should
          //   be extracted and abstracted
          fileContents => {
            try {
              // Parse file from JSON
              const state = fromJSON(fileContents)
              // Hydrate store from resulting object
              context.store.dispatch({
                type: 'HYDRATE', state,
              })
            } catch(e) {
              // If things don't work out, let the user know
              alert('Couldn\'t load file, found error', e)
            }
          }
        }
      />
      <Button
        onClick={
          () => stateToDownload(context.store.getState())
        }
      >
        <i className="fa fa-save" aria-hidden="true"></i>
      </Button>
    </ButtonGroup>{' '}
    <ButtonGroup>
      <Button>
        <i className="fa fa-file-archive-o" aria-hidden="true"></i>
      </Button>
      <Button
        onClick={
          () => context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'OPTIONS',
            modalProps: {
              large: true,
            },
          })
        }
      >
        <i className="fa fa-sliders" aria-hidden="true"></i>
      </Button>
    </ButtonGroup>
  </div>

Toolbar.contextTypes = {
  store: React.PropTypes.object
}

export default Toolbar
