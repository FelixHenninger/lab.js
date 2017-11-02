import React from 'react'
import { Control } from 'react-redux-form'
import { CardBody } from 'reactstrap'

import Form from '../Form'
import Card from '../../../Card'
import Editor from '../../../Editor'

export default ({ id, data }) =>
  // Chrome requires explicit height settings
  // throughout, which in turn necessitates
  // manually wrapping the content in a <CardBody>
  // as well as the h-100 classes at every level
  // TODO: The layout here should be revisited
  // periodically to check whether the chrome bug
  // has been addressed
  <Card title="Content"
    className="h-100"
    style={{ flexGrow: 1 }}
    wrapContent={ false }
  >
    <CardBody className="h-100">
      <Form
        id={ id }
        data={ data }
        keys={ ['content'] }
        getDispatch={ dispatch => this.formDispatch = dispatch }
        style={{
          // This is another hack for chrome,
          // which will otherwise cause the card
          // block to overflow.
          height: 'calc(100% - 30px)'
        }}
      >
        <Control.textarea
          model=".content"
          component={ Editor }
          controlProps={{
            language: 'html',
          }}
          debounce={ 300 }
        />
      </Form>
    </CardBody>
  </Card>
