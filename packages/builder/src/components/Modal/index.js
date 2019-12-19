import React from 'react'
import Modal from 'react-modal'
import classnames from 'classnames'

// Overall general-purpose modal container style
import './index.css'

export default ({ isOpen, onRequestClose, modalProps={}, children }) =>
  <Modal
    appElement={ document.getElementById('root') }
    isOpen={ isOpen }
    onRequestClose={ onRequestClose }
    className={ classnames({
      'modal-dialog': true,
      'modal-lg': modalProps.size === 'lg',
      'modal-xl': modalProps.size === 'xl',
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
    { children }
  </Modal>
