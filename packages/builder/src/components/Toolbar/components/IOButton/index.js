import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledTooltip } from 'reactstrap'
import downloadStaticJatos from '../../../../logic/io/export/modifiers/jatos'
import downloadStaticLocal from '../../../../logic/io/export/modifiers/local'
import downloadStaticPavlovia from '../../../../logic/io/export/modifiers/pavlovia'
import { fromJSON } from '../../../../logic/io/load'
import { stateToDownload } from '../../../../logic/io/save'
import { downloadSidecar as downloadPsychDS } from '../../../../logic/metadata/psych-ds'
import Icon from '../../../Icon'
import Uploader from '../../../Uploader'




const IOButton = (_, context) => {
  const commandKey = navigator.platform.startsWith('Mac')
    ? 'Cmd+s'
    : 'Ctrl+s'
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return <ButtonDropdown
    isOpen={dropdownOpen}
    toggle={() => setDropdownOpen(!dropdownOpen)}
  >
    <Button id="caret" outline color="secondary"
      onClick={e => stateToDownload(
        context.store.getState(), { removeInternals: e.shiftKey }
      )}
    >
      <Icon icon="save" weight="l" fallbackWeight="r" />
      <UncontrolledTooltip placement="bottom" target="caret">
        {commandKey}
      </UncontrolledTooltip>
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
        multiple={false}
        maxSize={255 * 1024 ** 2} // 250MB + some headroom
        onUpload={
          ([[content]]) => {
            try {
              // Parse file from JSON
              const state = fromJSON(content)
              // Hydrate store from resulting object
              context.store.dispatch({
                type: 'HYDRATE', state,
              })
            } catch (e) {
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
        onClick={e => stateToDownload(
          context.store.getState(), { removeInternals: e.shiftKey }
        )}
      >
        Save
      </DropdownItem>
      <DropdownItem divider />
      <DropdownItem header>Export for local use</DropdownItem>
      <DropdownItem
        onClick={() => downloadStaticLocal(context.store.getState())}
      >
        Offline data collection
      </DropdownItem>
      <DropdownItem divider />
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
        Generic web host… <span className="text-muted">(PHP backend)</span>
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
        Upload to Netlify… <span className="text-muted">(cloud provider)</span>
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
        Upload to Open Lab…
      </DropdownItem>
      <DropdownItem divider />
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
        Generic survey tools… <span className="text-muted">(Qualtrics, etc.)</span>
      </DropdownItem>
      <DropdownItem
        onClick={() => downloadStaticJatos(context.store.getState())}
      >
        JATOS <span className="text-muted">(Just Another Tool for Online Studies)</span>
      </DropdownItem>
      <DropdownItem
        onClick={() => downloadStaticPavlovia(context.store.getState())}
      >
        Pavlovia
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
        The Experiment Factory… <span className="text-muted">(v3)</span>
      </DropdownItem>
      <DropdownItem divider />
      <DropdownItem header>Generate metadata</DropdownItem>
      <DropdownItem
        onClick={
          () => downloadPsychDS(context.store.getState())
        }
      >
        Psych-DS sidecar template{' '}
        <span className="text-muted">(JSON-LD)</span>
      </DropdownItem>
    </DropdownMenu>
  </ButtonDropdown>
}

IOButton.contextTypes = {
  store: PropTypes.object
}

export default IOButton
