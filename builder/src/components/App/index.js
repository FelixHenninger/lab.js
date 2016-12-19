import React, { Component } from 'react'
import Layout from '../Layout'
import Sidebar from '../Sidebar'
import Modal from '../Modal'
import ComponentDetail from '../ComponentDetail'

class App extends Component {
  render() {
    return (
      <div>
        <Modal />
        <Layout sidebar={ <Sidebar /> }>
          <ComponentDetail />
        </Layout>
      </div>
    )
  }
}

export default App
