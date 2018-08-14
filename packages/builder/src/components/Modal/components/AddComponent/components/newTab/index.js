import React from 'react'
import PropTypes from 'prop-types'

import { Card, CardGroup, CardHeader, CardBody,
  ListGroup, ListGroupItem } from 'reactstrap'
import CollapsingCard from '../../../../../Card'
import { metadata, defaults, getMetadataByCategory
  } from '../../../../../../logic/components'
import Icon from '../../../../../Icon'

import './style.css'

const addComponent = (store, type, parent, index) => {
  store.dispatch({
    type: 'ADD_COMPONENT',
    parent, index,
    data: {
      ...metadata[type].defaults,
      title: metadata[type].name,
    },
  })
  // Because the component is assigned an id automatically
  // via the action, we need to look it up here
  store.dispatch({
    type: 'SHOW_COMPONENT_DETAIL',
    id: store.getState().components[parent].children[index],
  })
  // Closing the modal after changing the content below
  // improves rendering
  store.dispatch({
    type: 'HIDE_MODAL',
  })
}

const ComponentShortcut = ({ type, parent, index }, context) =>
  <Card
    className="add-component-card"
    onClick={ () => addComponent(context.store, type, parent, index) }
  >
    <CardHeader
      className="text-center"
    >
      <Icon
        icon={ metadata[type].icon }
        weight={ metadata[type].iconWeight }
        fallbackWeight={ metadata[type].iconFallbackWeight }
      />
    </CardHeader>
    <CardBody
      className="text-center"
    >
      <h5 className="card-title">
        { metadata[type].name }
      </h5>
      <h6
        className="card-subtitle mb-2 text-muted"
        style={{ fontWeight: '400' }}
      >
        { metadata[type].category }
      </h6>
    </CardBody>
  </Card>

ComponentShortcut.contextTypes = {
  store: PropTypes.object,
}

const ComponentList = ({ parent, index }, context) =>
  <div> {
    Object.entries(getMetadataByCategory()).map(([category, types]) =>
      <CollapsingCard
        key={ category }
        title={ category } open={ false }
        collapsable={ true }
        wrapContent={ false }
      >
        <ListGroup className="list-group-flush">
          {
            types.map(type =>
              <ListGroupItem
                key={ type }
                tag="a" href="#" action
                className="d-flex justify-content-between"
                onClick={
                  () => addComponent(context.store, type, parent, index)
                }
              >
                <span>
                  <strong>
                    { metadata[type].name }
                  </strong>&nbsp;
                  <small className="text-muted">
                    · { metadata[type].description }
                  </small>
                </span>
                <Icon
                  icon={ metadata[type].icon }
                  className="mt-1"
                  weight={ metadata[type].iconWeight }
                  fallbackWeight={ metadata[type].iconFallbackWeight }
                />
              </ListGroupItem>
            )
          }
        </ListGroup>
      </CollapsingCard>
    )
  } </div>

ComponentList.contextTypes = {
  store: PropTypes.object,
}

export default ({ parent, index }, context) =>
  <div>
    <CardGroup className="mb-3">
      {
        defaults.map(type =>
          <ComponentShortcut
            key={ type }
            type={ type }
            parent={ parent }
            index={ index }
          />
        )
      }
    </CardGroup>
    <ComponentList
      parent={ parent }
      index={ index }
    />
  </div>
