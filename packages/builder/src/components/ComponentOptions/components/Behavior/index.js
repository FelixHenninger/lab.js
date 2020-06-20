import React from 'react'

import Timeline from './components/Timeline'
import Responses from './components/Responses'
import Meta from './components/Meta'

import Form from '../Form'

export default ({ id, data }) =>
  <Form
    id={ id } data={ data }
    keys={ [
      'responses', 'correctResponse',
      'skip', 'skipCondition',
      'tardy', 'timeline', 'timeout',
    ] }
  >
    <Timeline />
    <Responses />
    <Meta />
  </Form>
