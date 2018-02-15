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
import ExportPostMessageModal from './components/ExportPostMessage'

// Overall general-purpose modal container style
import './index.css'

const MODAL_COMPONENTS = {
  'ADD_COMPONENT': AddComponentModal,
  'OPTIONS': OptionsModal,
  'SYSTEM_COMPATIBILITY': SystemCompatibilityModal,
  'EXPORT_PHP': ExportPHPModal,
  'EXPORT_PM': ExportPostMessageModal,
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

// Wait for the component to mount so that the document
// is in place when the main app element is selected
// (this is probably unnecessary in production, but the
// jsDom-based tests fail to render if this is called early)
CustomModal.componentWillMount = () => {
  // Indicate main app element
  // (so that it can be marked inactive for screen readers
  // as long as the modal is open)
  Modal.setAppElement('#root')
}

// Redux integration
CustomModal.contextTypes = {
  store: PropTypes.object
}

const ConnectedModal = connect(
  (state, ownProps) => state.modal
)(CustomModal)

export default ConnectedModal
