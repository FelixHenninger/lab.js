import React, { Component } from 'react'
import { LocalForm } from 'react-redux-form'

import { wrapScreen, updateComponent } from '../util'
import MetadataCard from '../../cards/Metadata'
import SequenceCard from './cards/Sequence'
import ResponsesCard from '../../cards/Responses'
import AdvancedOptionsCard from '../../cards/Advanced'

class Sequence extends Component {
  render() {
    const { id, data } = this.props
    return <LocalForm
      initialState={ data }
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
