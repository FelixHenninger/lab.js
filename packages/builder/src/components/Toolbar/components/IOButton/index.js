import React from 'react'
import PropTypes from 'prop-types'

import Dropdown from '../../../Dropdown'
import { Button, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

import Uploader from '../../../Uploader'
import Icon from '../../../Icon'

import { fromJSON } from '../../../../logic/io/load'
import { stateToDownload } from '../../../../logic/io/save'
import downloadStaticLocal from '../../../../logic/io/export/modifiers/local'
import downloadStaticJatos from '../../../../logic/io/export/modifiers/jatos'

const IOButton = (_, context) => {
  let dropdown = null

  return <Dropdown
    type="button"
    ref={ c => (dropdown = c) }
  >
    <Button id="caret" outline color="secondary"
      onClick={ e => stateToDownload(
        context.store.getState(), { removeInternals: e.shiftKey }
      ) }
    >
      <Icon icon="save" weight="l" fallbackWeight="r" />
    </Button>
    <DropdownToggle
      caret split
      outline color="secondary"
    />
    <DropdownMenu>
      <DropdownItem header>Study</DropdownItem>
      <DropdownItem
        onClick={() => {
          if (window.confirm('Are you sure you want to reset the study?')) {
            context.store.dispatch({ type: 'RESET_STATE' })
          }
        }}
      >
        New
      </DropdownItem>
      <Uploader
        accept="application/json"
        maxSize={ 55 * 10**6 } // 55 MB (50MB + some headroom)
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
            } finally {
              dropdown.toggle()
            }
          }
        }
        className="dropdown-item"
      >
        Open
      </Uploader>
      <DropdownItem
        onClick={ e => stateToDownload(
          context.store.getState(), { removeInternals: e.shiftKey }
        ) }
      >
        Save
      </DropdownItem>
      <DropdownItem divider/>
      <DropdownItem header>Export for local use</DropdownItem>
      <DropdownItem
        onClick={ () => downloadStaticLocal(context.store.getState()) }
      >
        Offline data collection
      </DropdownItem>
      <DropdownItem divider/>
      <DropdownItem header>Deploy study online</DropdownItem>
      <DropdownItem
        onClick={
          () => context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_PHP',
            modalProps: {},
          })
        }
      >
        Generic web host <span className="text-muted">(PHP backend)</span>
      </DropdownItem>
      <DropdownItem
        onClick={
          () => context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_NETLIFY',
            modalProps: {},
          })
        }
      >
        Upload to Netlify <span className="text-muted">(cloud provider)</span>
      </DropdownItem>
      <DropdownItem
        onClick={
          () => context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_OPENLAB',
            modalProps: {},
          })
        }
      >
        Upload to Open Lab
      </DropdownItem>
      <DropdownItem divider/>
      <DropdownItem header>Export as integration</DropdownItem>
      <DropdownItem
        onClick={
          () => context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_PM',
            modalProps: {},
          })
        }
      >
        Generic survey tools <span className="text-muted">(Qualtrics, etc.)</span>
      </DropdownItem>
      <DropdownItem
        onClick={ () => downloadStaticJatos(context.store.getState()) }
      >
        JATOS <span className="text-muted">(Just Another Tool for Online Studies)</span>
      </DropdownItem>
      <DropdownItem
        onClick={
          () => context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_EXPFACTORY',
            modalProps: {},
          })
        }
      >
        The Experiment Factory <span className="text-muted">(v3)</span>
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
}

IOButton.contextTypes = {
  store: PropTypes.object
}

export default IOButton
