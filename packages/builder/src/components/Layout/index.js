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

export default ({ sidebar, footer, children }) =>
  <div className="grid-wrapper">
    <div className="grid-sidebar">
      { sidebar }
    </div>
    <div className="grid-imprint">
      { footer }
    </div>
    <div className="grid-contents">
      {/* TODO: Remove xs size jump to 510px,
          possibly by setting minWidth */}
      <Container fluid
        className="h-100 d-flex flex-column"
        style={{
          minWidth: '510px',
          maxWidth: '1200px',
          minHeight: '600px',
          padding: '0',
        }}
      >
        { children }
      </Container>
    </div>
  </div>
