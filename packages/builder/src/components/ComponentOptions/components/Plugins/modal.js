import React from 'react'

import { ListGroup, ListGroupItem, Card as BaseCard } from 'reactstrap'

import Modal from '../../../Modal'
import Confirm from '../../../Modal/components/Confirm'
import { plugins } from '../../../../logic/plugins/library'

export default ({ isOpen, onRequestClose: requestClose, onAdd }) =>
  <Modal
    isOpen={ isOpen }
    onRequestClose={ requestClose }
  >
    <Confirm
      title="Plugins"
      closeHandler={ requestClose }
    >
      <p><strong>Plugins change the behavior of a component</strong>, and can add further functionality. Please select one to include it.</p>
      <BaseCard className="card-flush">
        <ListGroup className="list-group-flush">
          {
            Object.entries(plugins).map(([type, pluginData], index) =>
              <ListGroupItem
                key={ `plugin-available-${ index }` }
                action style={{ cursor: 'pointer' }}
                onClick={ () => {
                  onAdd(type)
                  requestClose()
                } }
              >
                <strong>{ pluginData.title }</strong>
              </ListGroupItem>
            )
          }
        </ListGroup>
      </BaseCard>
      <div className="mt-3">
        <small className="text-muted">
          Missing something? Ideas for improving things? Please <a href="https://labjs.readthedocs.io/en/latest/meta/contribute/index.html" target="_blank" rel="noopener noreferrer">suggest or contribute</a>!
        </small>
      </div>
    </Confirm>
  </Modal>
