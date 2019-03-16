import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'

import Icon from '../../Icon'
import { SystemContext } from '../../System'

import { populateCache } from '../../../logic/io/preview'
import { addDebugPlugin } from '../../../logic/io/export/modifiers/preview'
import { addDownloadPlugin } from '../../../logic/io/export/modifiers/local'
import PreviewWindow from '../../../logic/io/preview/PreviewWindow'

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

    this.openPreview = this.openPreview.bind(this)
  }

  componentDidMount() {
    window.addEventListener('preview:show', this.openPreview)
  }

  componentWillUnmount() {
    window.removeEventListener('preview:show', this.openPreview)
  }

  openPreview() {
    this.previewWindow.openOrFocus()

    return populateCache(
      this.context.store.getState(),
      state => addDownloadPlugin(addDebugPlugin(state)),
      // TODO: Ceci n'est pas une pipe
    ).then(
      // Reload page to provided URL
      // as soon as the preview study is complete.
      () => this.previewWindow.reload()
    ).catch(error => {
      console.log(`Received error while sending study data to API: ${ error }`)
    })
  }

  render() {
    const { windowState } = this.state
    return (
      <SystemContext.Consumer>
        {
          ({ previewActive }) =>
            <Button
              color="primary"
              onClick={ () => this.openPreview() }
              onMouseEnter={ () => {
                // Prepare potential preview
                const event = new Event('preview:preemt')
                window.dispatchEvent(event)
              }}
              disabled={ !previewActive }
            >
              <Icon
                icon={ windowState === 'closed' ? 'play' : 'sync-alt' }
                weight="s"
              />
            </Button>
        }
      </SystemContext.Consumer>
    )
  }
}

PreviewButton.contextTypes = {
  store: PropTypes.object
}
