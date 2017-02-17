import React from 'react'

import Card from '../../../../Card'
import Editor from '../../../../Editor'
import { Control } from 'react-redux-form'

export default (props) => {
  return <Card title={props.title}>
    <Control.textarea
      model={ props.model }
      component={ Editor }
      controlProps={{
        language: props.language,
        height: props.height || 200,
      }}
      debounce={ 300 }
    />
  </Card>
}
