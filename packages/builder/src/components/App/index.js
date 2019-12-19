import Raven from 'raven-js'
import React, { Component } from 'react'
import Layout from '../Layout'
import ReduxModal from '../Modal/redux'
import Shortcuts from '../Shortcuts'
import Error from './Error'

class App extends Component {
  constructor(props) {
    super(props)
    this.defaultState = { error: null, errorInfo: {} }
    this.state = { ...this.defaultState }
  }

  componentDidCatch(error, info) {
    Raven.captureException(error, { extra: info })
    this.setState({ error, errorInfo: info })
  }

  resetError() {
    this.setState({ ...this.defaultState })
  }

  render() {
    if (this.state.error) {
      return (
        <Error
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={() => this.resetError()}
        />
      )
    } else {
      return (
        <>
          <Shortcuts />
          <ReduxModal />
          <Layout />
        </>
      )
    }
  }
}

export default App
