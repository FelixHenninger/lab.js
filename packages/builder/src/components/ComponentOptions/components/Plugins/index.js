import React, { useState } from 'react'

import { Button } from 'reactstrap'
import { fromPairs, set } from 'lodash'

import Card from '../../../Card'
import Form from '../Form'
import Icon from '../../../Icon'
import { Table, DefaultRow } from '../../../Form/table'

import { loadPlugin } from '../../../../logic/plugins/library'
import PluginHint from './hint'
import PluginAddModal from './modal'

import GenericPlugin from './generic'
import StylePlugin from './custom/style'

export const PluginRow = ({ index, name, data, arrayHelpers }) => {
  const metadata = loadPlugin(data.type)

  let Component
  switch(data.type) {
    case 'style':
      Component = StylePlugin
      break
    default:
      Component = GenericPlugin
  }

  return (
    <DefaultRow index={ index } arrayHelpers={ arrayHelpers }>
      <Component
        index={ index }
        name={ name }
        data={ data }
        metadata={ metadata }
      />
    </DefaultRow>
  )
}

const getDefaultSettings = (pluginType) => {
  const metadata = loadPlugin(pluginType)

  const output = {
    type: pluginType
  }

  Object.entries(metadata.options)
    .forEach(([k, v]) => set(output, k, v.default ?? ''))

  return output
}

export const PluginFooter = ({ addItem }) => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <tfoot>
      <tr>
        <td />
        <td>
          <PluginAddModal
            isOpen={ modalOpen }
            onRequestClose={ () => setModalOpen(false) }
            onAdd={ type => addItem(getDefaultSettings(type)) }
          />
          <Button
            size="sm" block
            outline color="muted"
            className="hover-target"
            onClick={ () => setModalOpen(true) }
            onMouseUp={ e => e.target.blur() }
          >
            <Icon icon="plus" />
          </Button>
        </td>
        <td />
      </tr>
    </tfoot>
  )
}

export default ({ id, data }) =>
  <Card title="Plugins" badge="Beta" wrapContent={ false }>
    <Form
      id={ id } data={ data }
      keys={ ['plugins'] }
    >
      <PluginHint
        visible={
          !data.plugins ||
          (Array.isArray(data.plugins) && data.plugins.length === 0)
        }
      />
      <Table
        name="plugins"
        row={ PluginRow }
        footer={ PluginFooter }
        className="no-header"
      />
    </Form>
  </Card>
