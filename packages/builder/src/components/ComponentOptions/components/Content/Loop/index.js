import React from 'react'

import { CardBody } from 'reactstrap'

import Card from '../../../../Card'
import Form from '../../Form'

import SampleWidget from './SampleWidget'

export default ({ id, data }) =>
  <Form
    id={ id } data={ data }
    keys={ [ 'sample' ] }
  >
    <Card title="Loop" wrapContent={ false }>
      <CardBody>
        <SampleWidget />
      </CardBody>
    </Card>
    <Card title="Further options"
      /* ... */
    >
    </Card>
  </Form>
