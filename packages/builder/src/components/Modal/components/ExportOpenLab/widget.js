import React, { Component } from 'react'
import { ReactReduxContext } from 'react-redux'

import Icon from '../../../Icon'

import { stateToJSON } from '../../../../logic/io/save'

class OpenLabWidget extends Component {
  static contextType = ReactReduxContext

  constructor() {
    super()
    this.state = {
      widgetState: 'dormant'
    }
  }

  async submit() {
    this.setState({ widgetState: 'submitting' })

    const state = this.context.store.getState()
    const stateJSON = stateToJSON(state)

    const data = new window.FormData()
    data.append(
      'script',
      new Blob(
        [ stateJSON ],
        { type: 'application/json;charset=utf-8' }
      ),
      'labjs-study.json'
    )
    data.append('name',
      state.components['root'].metadata.title || 'Unnamed study')
    data.append('description',
      state.components['root'].metadata.description)

    try {
      // Send study to Open Lab
      const r = await fetch('https://open-lab.online/tests/labjs', {
        method: 'POST',
        body: data,
      })

      if (r.ok) {
        this.setState({
          widgetState: 'done',
          site_url: r.url,
          statusCode: r.status,
          statusText: r.statusText,
        })
      } else {
        // Non-2xx response
        this.setState({
          widgetState: 'error',
          statusCode: r.status,
          statusText: r.statusText,
        })
      }
    } catch (error) {
      this.setState({
        widgetState: 'error_transmission',
        statusCode: undefined,
        statusText: undefined,
      })
      console.log('transmission error', error)
    }
  }

  render() {
    switch(this.state.widgetState) {
      case 'submitting':
        return <div className="text-center">
          <Icon icon="spinner-third" className="fa-spin" />
        </div>
      case 'done':
        return <>
          <p>
            <strong className="text-success">Uploaded study.</strong> Please finalize the transfer by following the link below.
          </p>
          <a
            className="btn btn-outline-primary btn-lg btn-block"
            href={ this.state.site_url }
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage study on Open Lab
          </a>
        </>
      case 'error':
        return <p>
          <strong className="text-warning">Something went wrong during transmission.</strong> Open Lab sent us an error <code>{ this.state.statusCode }</code>, which means { this.state.statusText }.
        </p>
      case 'error_transmission':
        return <p>
          <strong className="text-danger">Something went wrong.</strong> We can't tell exactly what happened, but the transfer of the study to Open Lab was cancelled. Could you check your connection?
        </p>
      default:
        return null
    }
  }
}

export default OpenLabWidget
