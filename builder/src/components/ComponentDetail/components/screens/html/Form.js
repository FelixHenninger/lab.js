import React, { Component } from 'react'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { wrapScreen, updateComponent } from '../util'
import MetadataCard from '../../cards/Metadata'
import MonacoCard from '../../cards/Monaco'
import ResponsesCard from '../../cards/Responses'
import ScriptCard from '../../cards/Scripts'
import AdvancedOptionsCard from '../../cards/Advanced'

// TODO: This is almost entirely copy-pasted from the
// html.Screen component (with the exception of making
// hiding the responses card by default). Maybe this
// could be improved? At the same time, not all
// differences between the components are currently
// reflected in the builder.
class Form extends Component {
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
        icon="list-alt"
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

Form.contextTypes = {
  store: React.PropTypes.object
}

export default wrapScreen(Form)
