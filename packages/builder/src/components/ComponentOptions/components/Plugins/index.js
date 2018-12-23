import React from 'react'

import Card from '../../../Card'
import Icon from '../../../Icon'

export default () =>
  <Card title="Plugins">
    <div className="text-center p-5">
      <Icon
        icon="flask-potion"
        className="d-block text-muted p-3"
        style={{
          fontSize: '3.5rem',
        }}
      />
      <div className="text-muted">
        <strong>We're still working on this!</strong><br />
        <small>Please check back soon.</small>
      </div>
    </div>
  </Card>
