import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { updateComponent } from '../util'
import TabSet from '../../../../TabSet'
import MetadataCard from '../../cards/Metadata'
import MonacoCard from '../../cards/Monaco'
import ResponsesCard from '../../cards/Responses'
import ScriptCard from '../../cards/Scripts'
import AdvancedOptionsCard from '../../cards/Advanced'

class Screen extends Component {
  render() {
    const { id, data } = this.props
    const context = this.context
    return <LocalForm
      initialState={
        /* Select only relevant fields to avoid interactions
           between form and the remaining UI.
           TODO: This selects basically every field.
           Maybe we can do without? */
        pick(data, [
          'title', 'notes',
          'content', 'responses',
          'correctResponse', 'timeout',
          'messageHandlers',
          'tardy', 'skip', 'scrollTop',
        ])
      }
      onChange={ newData => updateComponent(context.store, id, newData) }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <TabSet
        tabs={{
          'Metadata': () => <MetadataCard icon="window-maximize" />,
          'Content': () => <MonacoCard
            model=".content"
            title="Content"
            language="html"
            height={ 600 }
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

Screen.contextTypes = {
  store: PropTypes.object
}

export default Screen
