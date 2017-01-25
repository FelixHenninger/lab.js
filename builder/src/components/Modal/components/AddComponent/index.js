import React from 'react'
import { Button, Card, CardBlock, CardHeader, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import { metadata } from '../../../../logic/components'
import './style.css'

const ComponentDisplay = ({ value, parent, index }, context) =>
  <Card
    className="add-component-card"
    onClick={ () => {
      context.store.dispatch({
        type: 'ADD_COMPONENT',
        parent, index,
        data: {
          ...value.defaults,
          title: value.name,
        },
      })
      // TODO: Show the new component
      context.store.dispatch({
        type: 'HIDE_MODAL',
      })
    }}
  >
    <CardHeader
      style={{
        textAlign: 'center',
      }}
    >
      <i
        className={`fa fa-${ value.icon }`}
        style={{
          fontSize: '2rem',
        }}
      ></i>
    </CardHeader>
    <CardBlock>
      <h5 className="card-title">{ value.name }</h5>
      <h6 className="card-subtitle mb-2 text-muted">{ value.category }</h6>
    </CardBlock>
  </Card>

ComponentDisplay.contextTypes = {
  store: React.PropTypes.object,
}

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
      <div className="card-group">
        {
          Object.entries(metadata).map(([key, value]) =>
            <ComponentDisplay
              key={ key }
              value={ value }
              parent={ parent }
              index={ index }
            />
          )
        }
      </div>
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
