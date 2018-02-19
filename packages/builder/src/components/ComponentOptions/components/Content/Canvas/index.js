import React from 'react'
import PropTypes from 'prop-types'
import Loadable from 'react-loadable'

import Card from '../../../../Card'
import { updateComponent } from '../../../../../actions/components'

const LoadableEditor = Loadable({
  loader: () => import('./editor'),
  loading() {
    return <div className="text-center">
      <i className="fas fa-spinner-third fa-spin my-3" />
    </div>
  }
})

const Editor = ({ id, data }, { store }) =>
  <Card title="Content">
    <LoadableEditor
      data={ data.content }
      onChange={
        newData => store.dispatch(
          updateComponent(id, { content: newData })
        )
      }
    />
  </Card>

Editor.contextTypes = {
  store: PropTypes.object
}

export default Editor
