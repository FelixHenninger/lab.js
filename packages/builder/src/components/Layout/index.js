import React from 'react'

// Bootstrap integration
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Row, Col } from 'reactstrap'

// Font Awesome
import 'font-awesome/css/font-awesome.css'

// Fira
import 'fira/fira.css'

export default ({ sidebar, children }) =>
  <Container style={{ minWidth: '992px' }}>
    <Row>
      <Col xs="4">{ sidebar }</Col>
      <Col xs="8">{ children }</Col>
    </Row>
  </Container>
