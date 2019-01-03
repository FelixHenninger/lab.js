import React from 'react'
import PropTypes from 'prop-types'

import { ListGroup, ListGroupItem } from 'reactstrap'

const PoolTab = ({ component, handleImport }, { store }) => {
  const components = store.getState().components
  const files = components[component].files
    ? components[component].files.rows.map(r => r[0])
    : []

  return <div>
    <ListGroup>
      {
        files.map((f, index) =>
          <ListGroupItem
            action tag="a"
            key={ index }
            style={{
              fontFamily: 'Fira Mono'
            }}
            onClick={ () => handleImport(component, f.localPath) }
          >
            { f.localPath }
          </ListGroupItem>
        )
      }
    </ListGroup>
  </div>
}

PoolTab.contextTypes = {
  store: PropTypes.object
}

export default PoolTab
