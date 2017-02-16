import React, { Component } from 'react'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { wrapScreen, updateComponent } from '../util'
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
          'tardy',
        ])
      }
      onChange={ newData => updateComponent(context.store, id, newData) }
      getDispatch={ dispatch => this.formDispatch = dispatch }
      >
      <MetadataCard
        icon="window-maximize"
      />
      <MonacoCard
        model=".content"
        title="Content"
        language="html"
        height={ 600 }
      />
      <ResponsesCard
        data={ data.responses }
        formDispatch={ this.formDispatch }
      />
      <ScriptCard
        data={ data.messageHandlers }
        formDispatch={ this.formDispatch }
      />
      <AdvancedOptionsCard />
    </LocalForm>
  }
}

Screen.contextTypes = {
  store: React.PropTypes.object
}

export default wrapScreen(Screen)
