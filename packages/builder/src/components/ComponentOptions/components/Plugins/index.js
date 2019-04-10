import React from 'react'
import { CardBody } from 'reactstrap'

import Card from '../../../Card'

import loadPlugin from '../../../../logic/plugins/load'

const PluginHeader = ({ metaData }) =>
  <>
    <h3 className="h5">
      { metaData.title }
      {
        metaData.description
          && <small className="text-muted"> · { metaData.description }</small>
      }
    </h3>
  </>

const Plugin = ({ index, data, metaData }) =>
  <CardBody>
    <PluginHeader index={ index } data={ data } metaData={ metaData } />
  </CardBody>

export default ({ id, data }) =>
  <Card title="Plugins" wrapContent={ false }>
    {
      (data.plugins || [])
        .map(pluginData => ({
          pluginData,
          metaData: loadPlugin(pluginData.type),
        }))
        .filter(({ metaData }) => metaData !== undefined)
        .map(({ pluginData, metaData }, index) =>
          <Plugin
            key={ `plugin-${ index }` }
            data={ pluginData }
            metaData={ metaData }
          />
        )
    }
  </Card>
