import React, { Component } from 'react'
import Layout from '../Layout'
import Sidebar from '../Sidebar'
import ComponentDetail from '../ComponentDetail'

class App extends Component {
  render() {
    return (
      <Layout sidebar={ <Sidebar /> }>
        <ComponentDetail />
      </Layout>
    )
  }
}

export default App
