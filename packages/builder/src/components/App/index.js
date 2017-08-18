import React, { Component } from 'react'

import Layout from '../Layout'
import Modal from '../Modal'

import Sidebar from '../Sidebar'
import Footer from '../Footer'
import ComponentDetail from '../ComponentDetail'

class App extends Component {
  render() {
    return (
      <div>
        <Modal />
        <Layout
          sidebar={ <Sidebar /> }
          footer={ <Footer /> }
        >
          <ComponentDetail />
        </Layout>
      </div>
    )
  }
}

export default App
