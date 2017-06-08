import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import { connect } from 'react-redux'
import classnames from 'classnames'

// Individual, task-specific modal content
import AddComponentModal from './components/AddComponent'
import OptionsModal from './components/Options'
import SystemCompatibilityModal from './components/SystemCompatibility'
import ExportPHPModal from './components/ExportPHP'

// Overall general-purpose modal container style
import './index.css'

const MODAL_COMPONENTS = {
  'ADD_COMPONENT': AddComponentModal,
  'OPTIONS': OptionsModal,
  'SYSTEM_COMPATIBILITY': SystemCompatibilityModal,
  'EXPORT_PHP': ExportPHPModal,
}

// TODO: See if the Modal component from react-modal
// can be replaced by its counterpart from reactstrap
const CustomModal = ({ modalType, modalProps }, context) => {
  const SpecificModal = MODAL_COMPONENTS[modalType] || 'div'
  return (
    <Modal
      isOpen={ modalType !== null }
      className={ classnames({
        'modal-dialog': true,
        'modal-lg': modalProps.large,
      }) }
      overlayClassName="modal fade show"
      contentLabel="App Modal"
      style={{
        overlay: {
          display: 'block',
          backgroundColor : 'rgba(0, 0, 0, 0.5)',
          opacity: '1',
          overflowX: 'hidden',
          overflowY: 'auto',
        }
      }}
    >
      <SpecificModal
        { ...modalProps }
        closeHandler={() => {
          context.store.dispatch({
            type: 'HIDE_MODAL',
          })
        }}
      />
    </Modal>
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
