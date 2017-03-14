import React, { Component } from 'react'
import { Button } from 'reactstrap'

import { populateCache } from '../../../logic/preview/io'
import PreviewWindow from '../../../logic/preview/PreviewWindow'

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
    // TODO: The interaction with the API should
    // probably be wrapped and placed with the
    // other application logic-related code.
    return populateCache(
      this.context.store.getState()
    ).then(
      // TODO: This code triggers the popup
      // blocker in modern browsers, because,
      // the command does not result from a
      // direct user interaction, but is
      // included in a promise chain. The
      // window should probably be opened
      // directly in the click handler, and
      // populated later when the backend
      // update is complete.
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
