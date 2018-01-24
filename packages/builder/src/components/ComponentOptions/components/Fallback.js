import React from 'react'

import Icon from '../../Icon'

export default () =>
  <div
    style={{
      textAlign: 'center'
    }}
  >
    <Icon
      icon="exclamation-circle"
      weight="s"
      style={{
        fontSize: '5rem',
        color: 'var(--gray)',
        marginTop: '3rem',
      }}
    />
    <h2 style={{ margin: '2rem 0 1rem' }} >
      No component selected
    </h2>
    <p>
      <strong>Please select a component on the left to get started</strong>,<br/>
      or add a new one via the plus button if you haven't already.
    </p>
  </div>
