import React from 'react'
import classnames from 'classnames'

// Bootstrap integration
import './bootstrap-custom.scss'
import { Container } from 'reactstrap'

// Fira
import 'fira/fira.css'

// Grid layout
import './index.css'

// Compute header mode
let mode = 'default'

if (window.location.href.includes('beta')) {
  mode = 'header-experimental'
} else if ((new Date()).getMonth() == 5) {
  mode = 'header-rainbow'
}

export default ({ sidebar, footer, children }) =>
  <div className="grid-wrapper">
    <div className={ classnames('grid-header', mode) }>
    </div>
    <div className="grid-sidebar">
      { sidebar }
    </div>
    <div className="grid-footer">
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
