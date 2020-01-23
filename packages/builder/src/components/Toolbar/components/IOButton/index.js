import React, { useState } from 'react'
import { useStore } from 'react-redux'

import { ButtonDropdown, Button, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

import Uploader from '../../../Uploader'
import Icon from '../../../Icon'

import { fromJSON } from '../../../../logic/io/load'
import { stateToDownload } from '../../../../logic/io/save'
import downloadStaticLocal from '../../../../logic/io/export/modifiers/local'
import downloadStaticJatos from '../../../../logic/io/export/modifiers/jatos'
import downloadStaticPavlovia from '../../../../logic/io/export/modifiers/pavlovia'
import { downloadSidecar as downloadPsychDS
  } from '../../../../logic/metadata/psych-ds'

// TODO: Refactor dispatch calls to action creators

const IOButton = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const store = useStore()

  return <ButtonDropdown
    isOpen={ dropdownOpen }
    toggle={ () => setDropdownOpen(!dropdownOpen) }
  >
    <Button id="caret" outline color="secondary"
      onClick={ e => stateToDownload(
        store.getState(), { removeInternals: e.shiftKey }
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
            store.dispatch({ type: 'RESET_STATE' })
          }
        }}
      >
        New
      </DropdownItem>
      <Uploader
        accept="application/json"
        multiple={ false }
        maxSize={ 255 * 1024 ** 2 } // 250MB + some headroom
        onUpload={
          ([[content]]) => {
            try {
              // Parse file from JSON
              const state = fromJSON(content)
              // Hydrate store from resulting object
              store.dispatch({
                type: 'HYDRATE', state,
              })
            } catch(e) {
              // If things don't work out, let the user know
              alert('Couldn\'t load file, found error', e)
            } finally {
              // TODO: Close this earlier if possible
              setDropdownOpen(false)
            }
          }
        }
        className="dropdown-item"
      >
        Open
      </Uploader>
      <DropdownItem
        onClick={ e => stateToDownload(
          store.getState(), { removeInternals: e.shiftKey }
        ) }
      >
        Save
      </DropdownItem>
      <DropdownItem divider/>
      <DropdownItem header>Export for local use</DropdownItem>
      <DropdownItem
        onClick={ () => downloadStaticLocal(store.getState()) }
      >
        Offline data collection
      </DropdownItem>
      <DropdownItem divider/>
      <DropdownItem header>Deploy study online</DropdownItem>
      <DropdownItem
        onClick={
          () => store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_PHP',
            modalProps: {},
          })
        }
      >
        Generic web host… <span className="text-muted">(PHP backend)</span>
      </DropdownItem>
      <DropdownItem
        onClick={
          () => store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_NETLIFY',
            modalProps: {},
          })
        }
      >
        Upload to Netlify… <span className="text-muted">(cloud provider)</span>
      </DropdownItem>
      <DropdownItem
        onClick={
          () => store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_OPENLAB',
            modalProps: {},
          })
        }
      >
        Upload to Open Lab…
      </DropdownItem>
      <DropdownItem divider/>
      <DropdownItem header>Export as integration</DropdownItem>
      <DropdownItem
        onClick={
          () => store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_PM',
            modalProps: {},
          })
        }
      >
        Generic survey tools… <span className="text-muted">(Qualtrics, etc.)</span>
      </DropdownItem>
      <DropdownItem
        onClick={ () => downloadStaticJatos(store.getState()) }
      >
        JATOS <span className="text-muted">(Just Another Tool for Online Studies)</span>
      </DropdownItem>
      <DropdownItem
        onClick={ () => downloadStaticPavlovia(store.getState()) }
      >
        Pavlovia
      </DropdownItem>
      <DropdownItem
        onClick={
          () => store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'EXPORT_EXPFACTORY',
            modalProps: {},
          })
        }
      >
        The Experiment Factory… <span className="text-muted">(v3)</span>
      </DropdownItem>
      <DropdownItem divider/>
      <DropdownItem header>Generate metadata</DropdownItem>
      <DropdownItem
        onClick={
          () => downloadPsychDS(store.getState())
        }
      >
        Psych-DS sidecar template{' '}
        <span className="text-muted">(JSON-LD)</span>
      </DropdownItem>
    </DropdownMenu>
  </ButtonDropdown>
}

export default IOButton
