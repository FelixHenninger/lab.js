import React from 'react'
import { Control } from 'react-redux-form'

import Form from '../Form'
import Card from '../../../Card'
import Editor from '../../../Editor'

export default ({ id, data }) =>
  <Card title="Content">
    <Form
      id={ id }
      data={ data }
      keys={ ['content'] }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <Control.textarea
        model=".content"
        component={ Editor }
        controlProps={{
          language: 'html',
          height: 600,
        }}
        debounce={ 300 }
      />
    </Form>
  </Card>
