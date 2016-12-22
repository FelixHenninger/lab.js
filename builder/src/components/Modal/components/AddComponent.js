import React from 'react'
import { Button, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import { metadata } from '../../../logic/components'

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
      <ul>
        {
          Object.entries(metadata).map(([key, value]) => {
            return <li key={ key }>
              <a href="#"
                onClick={ () => {
                  context.store.dispatch({
                    type: 'ADD_COMPONENT',
                    parent, index,
                    data: {
                      ...value.defaults,
                      title: value.name,
                    },
                  })
                  context.store.dispatch({
                    type: 'HIDE_MODAL',
                  })
                }}
                >
                <strong>{ value.name }</strong>
              </a>
              &nbsp;·&nbsp;
              <span className="text-muted">{ value.category }</span>
            </li>
          })
        }
      </ul>
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

AddComponentModal.contextTypes = {
  store: React.PropTypes.object,
}

export default AddComponentModal
