import React, { Component } from 'react'
import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { wrapScreen, updateComponent } from '../util'
import MetadataCard from '../../cards/Metadata'
import MonacoCard from '../../cards/Monaco'
import ResponsesCard from '../../cards/Responses'
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
           between form and the remaining UI */
        pick(data, [
          'title', 'notes',
          'responses',
          'correctResponse', 'timeout',
          'tardy',
        ])
      }
      onChange={ newData => updateComponent(context.store, id, newData) }
      getDispatch={ dispatch => this.formDispatch = dispatch }
      >
      <MetadataCard />
      <MonacoCard
        title="Content"
        language="html"
        value={ data.content }
        onChange={ newContent => updateComponent(
          context.store, id, { content: newContent }
        ) }
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

Form.contextTypes = {
  store: React.PropTypes.object
}

export default wrapScreen(Form)
