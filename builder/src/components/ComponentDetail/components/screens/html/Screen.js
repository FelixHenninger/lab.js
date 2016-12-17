import React, { Component } from 'react'
import { LocalForm } from 'react-redux-form'

import { wrapScreen, updateComponent } from '../util'
import MetadataCard from '../../cards/Metadata'
import MonacoCard from '../../cards/Monaco'
import ResponsesCard from '../../cards/Responses'
import AdvancedOptionsCard from '../../cards/Advanced'

class Screen extends Component {
  render() {
    const { id, data } = this.props
    const context = this.context
    return <LocalForm
      initialState={ data }
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
      />
      <AdvancedOptionsCard />
    </LocalForm>
  }
}

Screen.contextTypes = {
  store: React.PropTypes.object
}

export default wrapScreen(Screen)
