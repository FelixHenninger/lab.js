import React from 'react'
import Confirm from '../Confirm'

import NetlifyWidget from './widget'

const ExportNetlify = ({ closeHandler }) => {
  // Add variable to keep track of the Open Lab widget
  let widget = React.createRef()

  return <Confirm
    title={ <span>Upload to Netlify</span> }
    closeLabel="Close"
    closeHandler={ closeHandler }
    confirmLabel="Upload"
    confirmHandler={ () => {
      widget.current.triggerSubmit()
    } }
  >
    <p><strong><a href="https://www.netlify.com/" target="_blank" rel="noopener noreferrer">Netlify</a> will host your study for you and take care of data collection.</strong> Their service is very easy to use, free for basic studies, and inexpensive for large ones.</p>
    <p>To use Netlify, you'll need to <a href="https://app.netlify.com/signup" target="_blank" rel="noopener noreferrer">set up an account</a> with them. Our documentation describes in more detail <a href="http://labjs.readthedocs.io/en/latest/learn/deploy/4-netlify.html" target="_blank" rel="noopener noreferrer">how to do that</a>.</p>
    <hr />
    <NetlifyWidget ref={ widget } />
  </Confirm>
}

export default ExportNetlify
