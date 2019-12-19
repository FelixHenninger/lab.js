// Fira
import 'fira/fira.css'
import React, { Component } from 'react'
import { Button, Container } from 'reactstrap'
import ComponentHeader from '../ComponentHeader'
import ComponentOptions from '../ComponentOptions'
import Footer from '../Footer'
import Icon from '../Icon'
import Sidebar from '../Sidebar'
import Toolbar from '../Toolbar'
// Bootstrap integration
import './bootstrap-custom.scss'
// Grid layout
import './index.scss'

class Layout extends Component {
  constructor(props) {
    super(props)
    this.state = { isSidenavMinimized: false }
  }
  render() {
    return (
      <div
        className={`grid-wrapper ${
          this.state.isSidenavMinimized ? 'minimized' : ''
        }`}
      >
        <div className="grid-sidebar">
          <Button
            className="sidenavToggle-btn"
            color="transparent"
            onClick={() => {
              this.setState({
                isSidenavMinimized: !this.state.isSidenavMinimized,
              })
            }}
          >
            <Icon icon="chevron-left" />
          </Button>
          <div className="sidebar-toolbar">
            <Toolbar />
          </div>
          <div className="sidebar-content">
            <Sidebar />
          </div>
          <div className="sidebar-footer">
            <Footer />
          </div>
        </div>
        <div className="grid-contents">
          {/* TODO: Remove xs size jump to 510px,
            possibly by setting minWidth */}
          <Container
            fluid
            className="h-100 d-flex flex-column"
            style={{
              minWidth: '510px',
              maxWidth: '1200px',
              minHeight: '600px',
              padding: '0',
            }}
          >
            <ComponentHeader />
            <ComponentOptions />
          </Container>
        </div>
      </div>
    )
  }
}

export default Layout
