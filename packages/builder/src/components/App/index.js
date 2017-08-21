import React, { Component } from 'react'

import Layout from '../Layout'
import Modal from '../Modal'

import Sidebar from '../Sidebar'
import Footer from '../Footer'
import ComponentHeader from '../ComponentHeader'
import ComponentOptions from '../ComponentOptions'

class App extends Component {
  render() {
    return (
      <div>
        <Modal />
        <Layout
          sidebar={ <Sidebar /> }
          footer={ <Footer /> }
        >
          <ComponentHeader />
          <ComponentOptions />
        </Layout>
      </div>
    )
  }
}

export default App
