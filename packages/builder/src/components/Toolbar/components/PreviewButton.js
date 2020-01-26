import PropTypes from 'prop-types'
import Raven from 'raven-js'
import React, { Component } from 'react'
import { Button, UncontrolledTooltip } from 'reactstrap'
import { addDownloadPlugin } from '../../../logic/io/export/modifiers/local'
import { addDebugPlugin } from '../../../logic/io/export/modifiers/preview'
import { populateCache } from '../../../logic/io/preview'
import PreviewWindow from '../../../logic/io/preview/PreviewWindow'
import Icon from '../../Icon'
import { SystemContext } from '../../System'



export default class PreviewButton extends Component {
  commandKey = navigator.platform.startsWith('Mac')
    ? 'Cmd+p'
    : 'Ctrl+p'

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
      `${process.env.PUBLIC_URL}/api/labjs_preview/index.html`,
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

  async openPreview() {
    this.previewWindow.openOrFocus()

    try {
      await populateCache(
        this.context.store.getState(),
        state => addDownloadPlugin(addDebugPlugin(state)),
        // TODO: Ceci n'est pas une pipe
      )

      // Reload page to provided URL
      // as soon as the preview study is complete.
      this.previewWindow.reload()
    } catch (error) {
      this.previewWindow.close()
      if (error.name === 'QuotaExceededError') {
        alert(
          "Sorry, we couldn't generate the preview because " +
          "the browser wouldn't allow us to use storage space. " +
          "Could you check whether there's room on your hard drive?"
        )
      } else {
        console.log(`Received error while generating preview: ${error}`)
        Raven.captureException(error)
        alert(
          'Sorry, an error occured while we were trying ' +
          `to put together the study preview: ${error}`
        )
      }
    }
  }

  render() {
    const { windowState } = this.state
    return (
      <SystemContext.Consumer>
        {
          ({ previewActive }) =>
            <Button
              id="previewButton"
              color="primary"
              onClick={() => this.openPreview()}
              onMouseEnter={() => {
                // Prepare potential preview
                const event = new Event('preview:preemt')
                window.dispatchEvent(event)
              }}
              disabled={!previewActive}
            >
              <Icon
                icon={windowState === 'closed' ? 'play' : 'sync-alt'}
                weight="s"
              />
              <UncontrolledTooltip placement="bottom" target="previewButton">
                {this.commandKey}
              </UncontrolledTooltip>
            </Button>
        }
      </SystemContext.Consumer>
    )
  }
}

PreviewButton.contextTypes = {
  store: PropTypes.object
}
