import React from 'react'
import PropTypes from 'prop-types'
import { Card } from 'reactstrap'
import { TaskList } from '../../../../../ComponentOptions/components/Welcome/components/ExampleTab'

const basePath =
  'https://raw.githubusercontent.com/FelixHenninger/lab.js/master/templates/'

const TemplateTab = ({ parent, index }, context) =>
  <div>
    <Card
      style={{
        height: '225px',
        overflowY: 'auto',
      }}
    >
      <TaskList
        path={ basePath }
        loadHandler={ data => {
          try {
            context.store.dispatch({
              type: 'IMPORT_COMPONENT',
              parent, index,
              id: data.components.root.children[0],
              source: data.components,
            })
            context.store.dispatch({
              type: 'HIDE_MODAL',
            })
          } catch(e) {
            // If things don't work out, let the user know
            alert('Couldn\'t load file, found error', e)
          }
        } }
      />
    </Card>
  </div>

TemplateTab.contextTypes = {
  store: PropTypes.object,
}

export default TemplateTab

