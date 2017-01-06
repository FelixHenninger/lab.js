import React, { Component } from 'react'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { wrapScreen, updateComponent } from '../util'
import MetadataCard from '../../cards/Metadata'
import SequenceCard from './cards/Sequence'
import ResponsesCard from '../../cards/Responses'
import AdvancedOptionsCard from '../../cards/Advanced'

class Sequence extends Component {
  render() {
    const { id, data } = this.props
    return <LocalForm
      initialState={
        /* Select only relevant fields to avoid interactions
           between form and the remaining UI */
        pick(data, [
          'title', 'notes',
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
      <SequenceCard />
      <ResponsesCard
        data={ data.responses }
        formDispatch={ this.formDispatch }
        open={ false }
      />
      <AdvancedOptionsCard />
    </LocalForm>
  }
}

Sequence.contextTypes = {
  store: React.PropTypes.object
}

export default wrapScreen(Sequence)
