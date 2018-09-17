import React from 'react'
import PropTypes from 'prop-types'
import { Card } from 'reactstrap'
import { TaskList } from '../../../../../ComponentOptions/components/Welcome/components/ExampleTab'

import './style.css'

const basePath =
  'https://raw.githubusercontent.com/FelixHenninger/lab.js/master/templates/'

const TemplateTab = ({ parent, index }, context) =>
  <div className="template-tab">
    <h2 className="h5 mt-1">
      <span>Templates</span>
    </h2>
    <p>Click on any template to include it in your study; they're yours to use and extend. Please consider <a href="https://labjs.readthedocs.io/en/latest/meta/contribute/index.html">sharing your own favorites!</a></p>
    <Card>
      <TaskList
        path={ basePath }
        taskLabel="templates"
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
    <div className="mt-3">
      <small className="text-muted">
        Missing something? Ideas for improving things? Please <a href="https://labjs.readthedocs.io/en/latest/meta/contribute/index.html" target="_blank" rel="noopener noreferrer">suggest or contribute</a>!
      </small>
    </div>
  </div>

TemplateTab.contextTypes = {
  store: PropTypes.object,
}

export default TemplateTab

