import React, { Component } from 'react'
import Layout from '../Layout'
import Card from '../Card'
import MonacoCard from '../MonacoCard'
import Hint from '../Hint'

class App extends Component {
  render() {
    return (
      <Layout sidebar={ <div>Sidebar</div> }>
        <Card title="Card">
          Content
          <Hint id="hint-test" title="This is a hint" className="pull-right">
            This is some content. Woo!
          </Hint>
        </Card>
        <MonacoCard title="Editor"/>
      </Layout>
    )
  }
}

export default App
