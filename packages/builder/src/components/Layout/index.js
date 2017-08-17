import React from 'react'

// Bootstrap integration
import 'bootstrap/dist/css/bootstrap.css'
import { Container } from 'reactstrap'

// Font Awesome
import 'font-awesome/css/font-awesome.css'

// Fira
import 'fira/fira.css'

// Grid layout
import './index.css'

export default ({ sidebar, children }) =>
  <div className="grid-wrapper">
    <div className="grid-sidebar">
      { sidebar }
    </div>
    <div className="grid-contents">
      {/* TODO: Remove xs size jump to 510px,
          possibly by setting minWidth */}
      <Container fluid
        style={{
          minWidth: '510px',
          maxWidth: '1200px',
          padding: '0',
        }}
      >
        { children }
      </Container>
    </div>
  </div>
