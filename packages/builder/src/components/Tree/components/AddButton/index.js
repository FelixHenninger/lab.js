import React from 'react'

import Icon from '../../../Icon'

import './index.css'

export default ({ pinned, onClick }) =>
  <div
    className={ `addButton ${ pinned ? 'addButton-pinned' : '' }`}
    onClick={ onClick }
  >
    <Icon icon="plus" />
  </div>
