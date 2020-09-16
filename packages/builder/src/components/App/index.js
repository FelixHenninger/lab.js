import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'

import Error from './Error'
import Layout from '../Layout'
import ReduxModal from '../Modal/redux'
import Shortcuts from '../Shortcuts'

import Sidebar from '../Sidebar'
import Footer from '../Footer'
import ComponentHeader from '../ComponentHeader'
import ComponentOptions from '../ComponentOptions'

class App extends Component {
  constructor(props) {
    super(props)
    this.defaultState = { error: null, errorInfo: {} }
    this.state = { ...this.defaultState }
  }

  componentDidCatch(error, info) {
    Sentry.withScope((scope) => {
      scope.setExtras(info)
      scope.setTag('scope', 'crash')
      scope.setLevel('fatal')
      const eventId = Sentry.captureException(error)
      this.setState({ error, errorInfo: info, eventId })
    })
  }

  resetError() {
    this.setState({ ...this.defaultState })
  }

  render() {
    if (this.state.error) {
      return <Error
        error={ this.state.error }
        errorInfo={ this.state.errorInfo }
        eventId={ this.state.eventId }
        reset={ () => this.resetError() }
      />
    } else {
      return (
        <>
          <Shortcuts />
          <ReduxModal />
          <Layout
            sidebar={ <Sidebar /> }
            footer={ <Footer /> }
          >
            <ComponentHeader />
            <ComponentOptions />
          </Layout>
        </>
      )
    }
  }
}

export default App
