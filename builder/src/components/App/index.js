import React, { Component } from 'react'
import Layout from '../Layout'
import Card from '../Card'

class App extends Component {
  render() {
    return (
      <Layout sidebar={ <div>Sidebar</div> }>
        <Card title="Card">Content</Card>
      </Layout>
    )
  }
}

export default App
