import React, { useEffect, useState } from 'react'

import Confirm from '../Confirm'

const ExternalContent = ({ url }) => {
  const [state, setState] = useState({ state: 'empty', content: '' })

  const load = async (url) => {
    try {
      const response = await fetch(url)
      const content = await response.text()
      setState({ state: 'loaded', content })
    } catch (error) {
      setState({ state: 'error' })
    }
  }
  useEffect(() => { load(url) }, [url])

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

export default Legal
