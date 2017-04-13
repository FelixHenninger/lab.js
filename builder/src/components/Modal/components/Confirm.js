import React from 'react'
import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'

export default ({
  title, children,
  confirmLabel, confirmHandler,
  closeLabel, closeHandler
}) =>
  <div className="modal-content">
    <ModalHeader
      toggle={ closeHandler }
    >
      { title }
    </ModalHeader>
    <ModalBody>
      { children }
    </ModalBody>
    <ModalFooter>
      <Button
        outline color={ confirmHandler ? 'secondary' : 'primary' }
        onClick={ closeHandler }
      >
        { closeLabel || 'Cancel' }
      </Button>
      {
        confirmHandler
          ? <Button
              outline color="primary"
              onClick={ confirmHandler }
            >
              { confirmLabel || 'Okay' }
            </Button>
          : null
      }
    </ModalFooter>
  </div>
