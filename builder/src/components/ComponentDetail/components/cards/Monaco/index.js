import React from 'react'

import Card from '../../../../Card'
import Editor from '../../../../Editor'

export default (props) => {
  return <Card title={props.title}>
    <Editor {...props} />
  </Card>
}
