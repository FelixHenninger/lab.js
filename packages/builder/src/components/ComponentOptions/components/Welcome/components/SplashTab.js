import React from 'react'

import { CardBody, CardText, ListGroup, ListGroupItem, Media } from 'reactstrap'
import Icon from '../../../../Icon'

const ActivityItem = ({ icon, iconFallbackWeight, children }) =>
  <ListGroupItem action
    style={{
      color: 'var(--gray-dark)',
      fontSize: '0.975rem',
      paddingTop: '0.9rem',
    }}
  >
    <Media>
      <Media body>
        { children }
      </Media>
      <Icon
        icon={ icon }
        fallbackWeight={ iconFallbackWeight }
        className="fa-fw pt-1 pb-1"
        style={{ fontSize: '1.5rem' }}
      />
    </Media>
  </ListGroupItem>

export default () =>
  <div>
    <CardBody
      style={{ textAlign: 'center' }}
    >
      <h2 style={{ margin: '2rem 0 1rem' }} >
        Welcome!
      </h2>
      <CardText className="mb-2">
        <strong>Thank you for using <code>lab.js</code>!</strong><br/>
        We hope you find it useful, and that<br />
        you enjoy using it as much as we did building it.
      </CardText>
    </CardBody>
    <ListGroup className="list-group-flush">
      <ActivityItem icon="plus-square">
        <strong>Start building a study</strong><br />
        <span className="text-muted">
          by adding your first piece
        </span>
      </ActivityItem>
      <ActivityItem icon="rocket">
        <strong>Open an example</strong><br />
        <span className="text-muted">
          to see how things work
        </span>
      </ActivityItem>
      <ActivityItem icon="graduation-cap">
        <strong>Read the documentation</strong><br />
        <span className="text-muted">
          and learn everything there is to know
        </span>
      </ActivityItem>
      <ActivityItem icon="life-ring">
        <strong>Find support</strong><br />
        <span className="text-muted">
          Let us know if we can help, we'd be glad to!
        </span>
      </ActivityItem>
    </ListGroup>
  </div>
