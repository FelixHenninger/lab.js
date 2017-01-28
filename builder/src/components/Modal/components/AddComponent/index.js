import React from 'react'
import { Button, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import NewTab from './components/newTab'

const AddComponentModal = ({ parent, index, closeHandler }, context) =>
  <div className="modal-content">
    <ModalHeader
      toggle={ closeHandler }
    >
      Add Component&nbsp;
      <small className="text-muted">
        Parent: {parent}, Index: {index}
      </small>
    </ModalHeader>
    <ModalBody>
      <NewTab
        parent={ parent }
        index={ index }
      />
    </ModalBody>
    <ModalFooter>
      <Button
        color="secondary"
        onClick={ closeHandler }
        >
        Close
      </Button>
    </ModalFooter>
  </div>

export default AddComponentModal
