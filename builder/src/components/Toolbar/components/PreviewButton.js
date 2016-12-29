import React, { Component } from 'react'
import { Button } from 'reactstrap'

import PreviewWindow from '../../../logic/PreviewWindow'

export default class PreviewButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      windowState: 'closed',
    }

    // A PreviewWindow object keeps track
    // of the window state, and provides a
    // callback for status updates
    this.previewWindow = new PreviewWindow(
      'labjs_preview',
      windowState => this.setState({ windowState })
    )
  }

  clickHandler() {
    const { components, files } = this.context.store.getState()

    // TODO: The interaction with the API should
    // probably be wrapped and placed with the
    // other application logic-related code.
    return fetch('api/labjs_preview/update', {
      method: 'POST',
      body: JSON.stringify({
        version: 0.1,
        components,
        files,
      }),
    }).then(response => {
      console.log(`Sent study data to API, received status ${ response.status }`)
    }).then(
      () => this.previewWindow.openOrReload()
    ).catch(error => {
      console.log(`Received error while sending study data to API: ${ error }`)
    })
  }

  render() {
    const { windowState } = this.state
    return <Button
      color="primary"
      onClick={ () => this.clickHandler() }
    >
      <i
        className={ `fa fa-${ windowState === 'closed' ? 'play' : 'refresh'}` }
        aria-hidden="true"
      ></i>
    </Button>
  }
}

PreviewButton.contextTypes = {
  store: React.PropTypes.object
}
