import React, { Component } from 'react'
import { ReactReduxContext } from 'react-redux'

import { Button } from 'reactstrap'
import * as Sentry from '@sentry/browser'

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

    // Create reference to the actual button element
    this.button = React.createRef()

    this.openPreview = this.openPreview.bind(this)
    this.simulateClick = this.simulateClick.bind(this)
  }

  // NOTE: This is a fairly indirect way of opening the preview,
  // which is used to react to keyboard shortcuts. The click
  // simulation is necessary to be able to use the store link,
  // which is being passed through the react context. In the future,
  // the entire PreviewButton component could subscribe to the store,
  // making it available throughout this code, and enabling direct
  // access to the openPreview method.
  componentDidMount() {
    window.addEventListener('preview:show', this.simulateClick)
  }

  componentWillUnmount() {
    window.removeEventListener('preview:show', this.simulateClick)
  }

  simulateClick() {
    this.button.current.onClick()
  }

  async openPreview(store) {
    this.previewWindow.openOrFocus()

    try {
      await populateCache(
        store.getState(),
        state => addDownloadPlugin(addDebugPlugin(state)),
        { headerOptions: { dev: true }}, // load development build for preview
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
        console.log(`Received error while generating preview: ${ error }`)
        Sentry.withScope((scope) => {
          scope.setTag('scope', 'preview')
          Sentry.captureException(error)
        })
        alert(
          'Sorry, an error occured while we were trying ' +
          `to put together the study preview: ${ error }`
        )
      }
    }
  }

  render() {
    const { windowState } = this.state
    return (
      <SystemContext.Consumer>
        {({ previewActive }) =>
          <ReactReduxContext.Consumer>
            {({ store }) =>
              <Button
                color="primary"
                ref={ this.button }
                onClick={ () => this.openPreview(store) }
                onMouseEnter={ () => {
                  // Prepare potential preview
                  if (previewActive) {
                    const event = new Event('preview:preempt')
                    window.dispatchEvent(event)
                  }
                }}
                disabled={ !previewActive }
              >
                <Icon
                  icon={ windowState === 'closed' ? 'play' : 'sync-alt' }
                  weight="s"
                />
              </Button>
            }
          </ReactReduxContext.Consumer>
        }
      </SystemContext.Consumer>
    )
  }
}
