import React from 'react'

import Dropdown from '../../../Dropdown'
import { Button, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

import Uploader from '../../../Uploader'
import { fromJSON } from '../../../../logic/io/load'
import { stateToDownload } from '../../../../logic/io/save'
import { exportStatic } from '../../../../logic/io/export'

const IOButton = (_, context) =>
  <Dropdown
    type='button'
  >
    <Button id='caret'
      onClick={ () => stateToDownload(context.store.getState()) }
    >
      <i className='fa fa-save' aria-hidden='true'></i>
    </Button>
    <DropdownToggle caret split />
    <DropdownMenu>
      <DropdownItem header>Study</DropdownItem>
      <DropdownItem
        onClick={() => {
          if (window.confirm('Do you really want to reset the study?')) {
            context.store.dispatch({ type: 'RESET_STATE' })
            context.store.dispatch({ type: 'SHOW_COMPONENT_DETAIL', id: null })
          }
        }}
      >
        New
      </DropdownItem>
      <Uploader
        accept='application/json'
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
      >
        <DropdownItem>
          Open
        </DropdownItem>
      </Uploader>
      <DropdownItem
        onClick={
          () => stateToDownload(context.store.getState())
        }
      >
        Save
      </DropdownItem>
      <DropdownItem divider/>
      <DropdownItem header>Export as bundle</DropdownItem>
      <DropdownItem
        onClick={ () => exportStatic(context.store.getState()) }
      >
        Plain <span className='text-muted'>(no backend)</span>
      </DropdownItem>
      <DropdownItem
        onClick={
          () => context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_PHP',
            modalProps: {},
          })
        }
      >
        PHP backend
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>

IOButton.contextTypes = {
  store: React.PropTypes.object
}

export default IOButton
