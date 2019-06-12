import React, { lazy, Suspense } from 'react'
import PropTypes from 'prop-types'

import Card from '../../../../Card'
import Spinner from '../../../../Spinner'
import { updateComponent } from '../../../../../actions/components'

const CanvasEditor = lazy(() => import('./editor'))

const Editor = ({ id, data }, { store }) =>
  <Card title="Content">
    <Suspense fallback={ <Spinner /> }>
      <CanvasEditor
        data={ data.content }
        onChange={
          newData => store.dispatch(
            updateComponent(id, { content: newData })
          )
        }
      />
    </Suspense>
  </Card>

Editor.contextTypes = {
  store: PropTypes.object
}

export default Editor
