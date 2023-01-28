import React from 'react'

import Icon from '../../../Icon'

const PluginHint = ({ visible }) =>
  visible
    ? <div className="text-center p-5 pb-2">
        <Icon
          icon="plug"
          className="d-block text-muted p-3"
          style={{
            fontSize: '3.5rem',
          }}
        />
        <div className="text-muted">
          <strong>
            Plugins extend components' functionality
          </strong><br />
          <small>Please click below to add one.</small>
        </div>
      </div>
    : null

export default PluginHint
