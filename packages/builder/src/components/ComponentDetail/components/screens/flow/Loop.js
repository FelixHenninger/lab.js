import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { wrapScreen, updateComponent } from '../util'
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
          'tardy', 'skip',
        ])
      }
      onChange={ newData => updateComponent(this.context.store, id, newData) }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <MetadataCard
        icon="repeat"
      />
      <LoopCard
        data={ data.templateParameters }
        formDispatch={ this.formDispatch }
      />
      <ResponsesCard
        data={ data.responses }
        formDispatch={ this.formDispatch }
        open={ false }
      />
      <ScriptCard
        data={ data.messageHandlers }
        formDispatch={ this.formDispatch }
      />
      <AdvancedOptionsCard />
    </LocalForm>
  }
}

Loop.contextTypes = {
  store: PropTypes.object
}

export default wrapScreen(Loop)
