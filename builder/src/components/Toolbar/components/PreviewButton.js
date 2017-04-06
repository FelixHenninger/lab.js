import React, { Component } from 'react'
import { Button } from 'reactstrap'

import { populateCache } from '../../../logic/preview/io'
import PreviewWindow from '../../../logic/preview/PreviewWindow'

const addDebugPlugin = (state) => {
  // Add debug plugin to root component
  state.components.root.plugins = [
    { type: 'lab.plugins.Debug' }
  ]

  return state
}

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
      // TODO: When we enable multiple
      // parallel instances, change labjs_preview
      // with a variable instance identifier
      `${ process.env.PUBLIC_URL }/api/labjs_preview/index.html`,
      windowState => this.setState({ windowState })
    )
  }

  clickHandler() {
    this.previewWindow.openIfNecessary()

    return populateCache(
      this.context.store.getState(), addDebugPlugin,
    ).then(
      () => this.previewWindow.reload()
    ).catch(error => {
      console.log(`Received error while sending study data to API: ${ error }`)
    })
  }

  render() {
    const { windowState } = this.state
    return <Button
      color="primary"
      onClick={ () => this.clickHandler() }
      disabled={ !('serviceWorker' in navigator) }
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
