import React from 'react'

// Bootstrap integration
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Row, Col } from 'reactstrap'

// Font Awesome
import 'font-awesome/css/font-awesome.css'

// Fira
import 'fira/fira.css'

export default ({ sidebar, children }) =>
  <Container fluid style={{ minWidth: '992px' }}>
    <Row>
      <Col xs="3"
        style={{
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          paddingTop: '30px',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        { sidebar }
      </Col>
      <Col xs="9"
        style={{
          paddingTop: '30px',
        }}
      >
        {/* TODO: Remove xs size jump to 510px,
            possibly by setting minWidth */}
        <Container>
          { children }
        </Container>
      </Col>
    </Row>
  </Container>
