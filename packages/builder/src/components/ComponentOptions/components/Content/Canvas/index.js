import React, { lazy, Suspense } from 'react'
import { connect } from 'react-redux'

import Card from '../../../../Card'
import Spinner from '../../../../Spinner'
import { updateComponent } from '../../../../../actions/components'

const CanvasEditor = lazy(() => import('./editor'))

const Editor = ({ id, data, updateComponent }) =>
  <Card title="Content">
    <Suspense fallback={ <Spinner /> }>
      <CanvasEditor
        id={ id }
        data={ data.content }
        onChange={
          newData => updateComponent(id, { content: newData })
        }
      />
    </Suspense>
  </Card>

const mapDispatchToProps = {
  updateComponent
}

export default connect(null, mapDispatchToProps)(Editor)
