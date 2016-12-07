import React, { Component } from 'react'
import Layout from '../Layout'
import Card from '../Card'
import MonacoCard from '../MonacoCard'

class App extends Component {
  render() {
    return (
      <Layout sidebar={ <div>Sidebar</div> }>
        <Card title="Card">Content</Card>
        <MonacoCard title="Editor"/>
      </Layout>
    )
  }
}

export default App
