import React, { Component } from 'react'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { wrapScreen, updateComponent } from '../util'
import MetadataCard from '../../cards/Metadata'
import LoopCard from './cards/Loop'
import ResponsesCard from '../../cards/Responses'
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
          'tardy',
        ])
      }
      onChange={ newData => updateComponent(this.context.store, id, newData) }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <MetadataCard />
      <LoopCard
        data={ data.templateParameters }
        formDispatch={ this.formDispatch }
      />
      <ResponsesCard
        data={ data.responses }
        formDispatch={ this.formDispatch }
        open={ false }
      />
      <AdvancedOptionsCard />
    </LocalForm>
  }
}

Loop.contextTypes = {
  store: React.PropTypes.object
}

export default wrapScreen(Loop)
