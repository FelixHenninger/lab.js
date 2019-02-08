import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import Confirm from '../Confirm'

const ExternalContent = ({ url }) => {
  const [state, setState] = useState({ state: 'empty', content: '' })

  useEffect(() => {
    fetch(url)
      .then(response => response.text())
      .then(content => setState({ state: 'loaded', content }) )
      .catch(() => setState({ state: 'error' }) )
  }, [url])

  return <div dangerouslySetInnerHTML={{ __html: state.content }}></div>
}


const Legal = ({ closeHandler }) =>
  <Confirm
    title={ <span>Legal</span> }
    closeLabel="Done"
    closeHandler={ closeHandler }
  >
    <ExternalContent url="/content/legal.html" />
  </Confirm>

Legal.contextTypes = {
  store: PropTypes.object
}

export default Legal
