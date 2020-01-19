// Not using JSX, we don't need to import React proper
import { Component } from 'react'
import { ReactReduxContext } from 'react-redux'

import { stateToDownload } from '../../logic/io/save'

// Commands are associated with the command key on macs,
// and with CTRL elsewhere
const commandKey = navigator.platform.startsWith('Mac')
  ? 'metaKey'
  : 'ctrlKey'

class Shortcuts extends Component {
  static contextType = ReactReduxContext

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
      window.dispatchEvent(new Event('preview:preempt'))
      e.preventDefault()
      window.dispatchEvent(new Event('preview:show'))
    } else if (e.key === 'Backspace' && e.target === document.body) {
      e.preventDefault()
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

export default Shortcuts
