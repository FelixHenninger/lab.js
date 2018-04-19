import React from 'react'
import PropTypes from 'prop-types'
import Confirm from '../Confirm'

import NetlifyWidget from './widget'

const ExportNetlify = ({ closeHandler }, { store }) =>
  <Confirm
    title={ <span>Upload to Netlify</span> }
    closeLabel="Close"
    closeHandler={ closeHandler }
    confirmLabel="Upload"
    confirmHandler={ () => {
      this._netlifyWidget.triggerSubmit()
    } }
  >
    <p><strong><a href="https://www.netlify.com/" target="_blank" rel="noopener noreferrer">Netlify</a> will host your study for you and take care of data collection.</strong> Their service is very easy to use, free for basic studies, and inexpensive for large ones.</p>
    <p>To use Netlify, you'll need to <a href="https://app.netlify.com/signup" target="_blank" rel="noopener noreferrer">set up an account</a> with them. Our documentation describes in more detail <a href="http://labjs.readthedocs.io/en/latest/learn/deploy/4-netlify.html" target="_blank" rel="noopener noreferrer">how to do that</a>.</p>
    <hr />
    <NetlifyWidget
      ref={ widget => this._netlifyWidget = widget }
    />
  </Confirm>

ExportNetlify.contextTypes = {
  store: PropTypes.object
}

export default ExportNetlify
