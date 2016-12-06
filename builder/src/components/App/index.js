import React, { Component } from 'react'
import Layout from '../Layout'

class App extends Component {
  render() {
    return (
      <Layout sidebar={ <div>Sidebar</div> }>
        Main area
      </Layout>
    )
  }
}

export default App
