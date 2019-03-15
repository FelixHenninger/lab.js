// Not using JSX, we don't need to import React proper
import { Component } from 'react'
import PropTypes from 'prop-types'

import { stateToDownload } from '../../logic/io/save'

// Commands are associated with the command key on macs,
// and with CTRL elsewhere
const commandKey = navigator.platform.startsWith('Mac')
  ? 'metaKey'
  : 'ctrlKey'

class Shortcuts extends Component {
  constructor(props) {
    super(props)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  handleKeyDown(e) {
    if(e[commandKey] && e.key === 's') {
      e.preventDefault()

      // Save study
      if (!e.repeat) {
        stateToDownload(
          this.context.store.getState(), { removeInternals: e.shiftKey }
        )
      }
    } else if (e[commandKey] && e.key === 'p') {
      // TODO: I would much rather call into the preview logic directly,
      // as opposed to using the event interconnect.
      e.preventDefault()
      const event = new Event('preview:show')
      window.dispatchEvent(event)
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  render() {
    return null
  }
}

Shortcuts.contextTypes = {
  store: PropTypes.object
}

export default Shortcuts
