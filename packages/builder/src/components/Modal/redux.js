import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import GenericModal from './index'

// Individual, task-specific modal content
import AddComponentModal from './components/AddComponent'
import OptionsModal from './components/Options'
import SystemCompatibilityModal from './components/SystemCompatibility'
import ExportExpFactoryModal from './components/ExportExpFactory'
import ExportNetlifyModal from './components/ExportNetlify'
import ExportOpenLabModal from './components/ExportOpenLab'
import ExportPHPModal from './components/ExportPHP'
import ExportPostMessageModal from './components/ExportPostMessage'
import LegalModal from './components/Legal'

const MODAL_COMPONENTS = {
  'ADD_COMPONENT': AddComponentModal,
  'OPTIONS': OptionsModal,
  'SYSTEM_COMPATIBILITY': SystemCompatibilityModal,
  'EXPORT_EXPFACTORY': ExportExpFactoryModal,
  'EXPORT_NETLIFY': ExportNetlifyModal,
  'EXPORT_OPENLAB': ExportOpenLabModal,
  'EXPORT_PHP': ExportPHPModal,
  'EXPORT_PM': ExportPostMessageModal,
  'LEGAL': LegalModal,
}

const MODAL_SIZES = {
  'OPTIONS': 'xl'
}

// TODO: See if the Modal component from react-modal
// can be replaced by its counterpart from reactstrap
const CustomModal = ({ modalType, modalProps }, context) => {
  const SpecificModal = MODAL_COMPONENTS[modalType]
  return (
    <GenericModal
      isOpen={ modalType !== null }
      onRequestClose={ () => {
        context.store.dispatch({
          type: 'HIDE_MODAL',
        })
      } }
      modalProps={{
        size: MODAL_SIZES[modalType] || 'md',
        ...modalProps
      }}
    >
      {
        SpecificModal !== undefined
          ? <SpecificModal
              { ...modalProps }
              closeHandler={() => {
                context.store.dispatch({
                  type: 'HIDE_MODAL',
                })
              }}
            />
          : ''
      }
    </GenericModal>
  )
}

// Redux integration
CustomModal.contextTypes = {
  store: PropTypes.object
}

const ConnectedModal = connect(
  (state, ownProps) => state.modal
)(CustomModal)

export default ConnectedModal
