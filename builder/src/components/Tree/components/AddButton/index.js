import React from 'react'

import './index.css'

export default ({ pinned, onClick }) =>
  <div
    className={ `addButton ${ pinned ? 'addButton-pinned' : '' }`}
    onClick={ onClick }
  >
    <i className="fa fa-plus"></i>
  </div>
