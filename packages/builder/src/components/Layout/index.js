// Fira
import 'fira/fira.css'
import React from 'react'
import { Container } from 'reactstrap'
// Bootstrap integration
import './bootstrap-custom.scss'
// Grid layout
import './index.scss'

export default ({ toolbar, sidebar, footer, children }) => (
  <div className="grid-wrapper">
    <div className="grid-sidebar">
      <div className="sidebar-toolbar">{toolbar}</div>
      <div className="sidebar-content">{sidebar}</div>
      <div className="sidebar-footer">{footer}</div>
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
        {children}
      </Container>
    </div>
  </div>
)
