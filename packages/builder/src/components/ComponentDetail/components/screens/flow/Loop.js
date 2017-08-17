import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { updateComponent } from '../util'
import TabSet from '../../../../TabSet'
import MetadataCard from '../../cards/Metadata'
import LoopCard from './cards/Loop'
import ResponsesCard from '../../cards/Responses'
import ScriptCard from '../../cards/Scripts'
import AdvancedOptionsCard from '../../cards/Advanced'

class Loop extends Component {
  render() {
    const { id, data } = this.props
    return <LocalForm
      initialState={
        /* Select only relevant fields to avoid interactions
           between form and the remaining UI */
        pick(data, [
          'title', 'notes',
          'templateParameters',
          'shuffle',
          'responses',
          'correctResponse', 'timeout',
          'messageHandlers',
          'tardy', 'skip', 'scrollTop',
        ])
      }
      onChange={ newData => updateComponent(this.context.store, id, newData) }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <TabSet
        tabs={{
          'Metadata': () => <MetadataCard icon="repeat" />,
          'Content': () => <LoopCard
            data={ data.templateParameters }
            formDispatch={ this.formDispatch }
          />,
          'Responses': () => <ResponsesCard
            data={ data.responses }
            formDispatch={ this.formDispatch }
          />,
          'Scripts': () => <ScriptCard
            data={ data.messageHandlers }
            formDispatch={ this.formDispatch }
          />,
          'Advanced options': () => <AdvancedOptionsCard />,
        }}
        activeTab='Metadata'
      />
    </LocalForm>
  }
}

Loop.contextTypes = {
  store: PropTypes.object
}

export default Loop
