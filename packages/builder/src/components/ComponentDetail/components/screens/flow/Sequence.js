import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { updateComponent } from '../util'
import TabSet from '../../../../TabSet'
import MetadataCard from '../../cards/Metadata'
import SequenceCard from './cards/Sequence'
import ResponsesCard from '../../cards/Responses'
import ScriptCard from '../../cards/Scripts'
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
          'messageHandlers',
          'tardy', 'skip', 'scrollTop',
        ])
      }
      onChange={ newData => updateComponent(this.context.store, id, newData) }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <TabSet
        tabs={{
          'Metadata': () => <MetadataCard icon="sort-amount-asc" />,
          'Content': () => <SequenceCard />,
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

Sequence.contextTypes = {
  store: PropTypes.object
}

export default Sequence
