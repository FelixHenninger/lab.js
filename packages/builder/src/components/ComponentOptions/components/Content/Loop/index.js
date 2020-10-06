import React from 'react'

import { CardBody } from 'reactstrap'
import { uniqBy } from 'lodash'

import Card from '../../../../Card'
import Form from '../../Form'

import Grid from './Grid'
import SampleWidget from './SampleWidget'
import ShuffleGroups from './ShuffleGroups'
import IndexParameter from './indexParameter'

export default ({ id, data }) =>
  <Form
    id={ id } data={ data }
    keys={ [ 'sample', 'shuffle', 'templateParameters', 'indexParameter' ] }
  >
    <Card title="Loop" wrapContent={ false }>
      <Grid />
      <CardBody>
        <SampleWidget />
      </CardBody>
    </Card>
    <Card title="Further options"
      open={
        uniqBy(
          data.templateParameters.columns,
          c => c.shuffleGroup
        ).length > 1
      }
      collapsable={ true }
      wrapContent={ false }
      className="mt-4"
    >
      <CardBody className="border-bottom">
        <h2 className="h6">Counter</h2>
        <IndexParameter />
      </CardBody>
      <CardBody className="pb-0">
        <h2 className="h6">Parameter groups</h2>
      </CardBody>
      <ShuffleGroups />
    </Card>
  </Form>
