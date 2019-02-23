import React, { Component } from 'react'

import Timeline from './components/Timeline'
import Responses from './components/Responses'
import Meta from './components/Meta'

import Form from '../Form'

export default class extends Component {
  constructor(props) {
    super(props)
    this.formDispatch = () => console.log('invalid dispatch')
  }

  render() {
    const { id, data } = this.props

    return <Form
      id={ id }
      data={ data }
      keys={ [
        'responses', 'correctResponse',
        'skip', 'skipCondition',
        'tardy', 'timeline', 'timeout',
      ] }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <Timeline
        id={ id }
        data={ data }
        formDispatch={ action => this.formDispatch(action) }
      />
      <Responses
        id={ id }
        data={ data }
        formDispatch={ action => this.formDispatch(action) }
      />
      <Meta
        data={ data }
      />
    </Form>
  }
}
