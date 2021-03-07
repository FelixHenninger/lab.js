import React, { useState } from 'react'
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

const Header = () => {
  const [messageVisible, setMessageVisible] = useState(true)

  return (
    <div className={ classnames('grid-header', mode) }>
      {
        mode === 'header-experimental' && messageVisible
          ? <>
              <div className="m-1">
                <button
                  type="button"
                  className="close"
                  aria-label="Close"
                  onClick={ () => setMessageVisible(false) }
                >
                  <span aria-hidden="true">&times;</span>
                </button>
                <strong>
                  This version of <code>lab.js</code> is experimental!
                </strong>{' '}
                It is currently unstable and prone to break,
                please use the{' '}
                <a
                  href="https://labjs.felixhenninger.com"
                  style={{ fontWeight: 600 }}
                >
                  stable version
                </a>{' '}
                for the time being.
              </div>
            </>
          : null
      }
    </div>
  )
}

export default ({ sidebar, footer, children }) =>
  <div className="grid-wrapper">
    <Header />
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
