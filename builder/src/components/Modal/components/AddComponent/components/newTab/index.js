import React from 'react'

import { Card, CardBlock, CardGroup, CardHeader } from 'reactstrap'
import { metadata, defaults } from '../../../../../../logic/components'

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
      <h5 className="card-title font-weight-bold">{ value.name }</h5>
      <h6 className="card-subtitle mb-2 text-muted">{ value.category }</h6>
    </CardBlock>
  </Card>

ComponentDisplay.contextTypes = {
  store: React.PropTypes.object,
}

export default ({ parent, index }) =>
  <CardGroup>
    {
      defaults.map(c => [c, metadata[c]]).map(([key, value]) =>
        <ComponentDisplay
          key={ key }
          value={ value }
          parent={ parent }
          index={ index }
        />
      )
    }
  </CardGroup>
