import React from 'react'
import PropTypes from 'prop-types'

import Card from '../../../../Card'
import CanvasEditor from './editor'

import { updateComponent } from '../../../../../actions/components'

const Editor = ({ id, data }, { store }) =>
  <Card title="Content">
    <CanvasEditor
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
