import React from 'react'
import Confirm from '../Confirm'

import OpenLabWidget from './widget'

const ExportOpenLab = ({ closeHandler }) => {
  // Add variable to keep track of the Open Lab widget
  let widget = React.createRef()

  return <Confirm
    title={ <span>Upload to Open Lab</span> }
    closeLabel="Close"
    closeHandler={ closeHandler }
    confirmLabel="Upload"
    confirmHandler={ () => {
      widget.current.submit()
    } }
  >
    <p><strong><a href="https://www.open-lab.online/" target="_blank" rel="noopener noreferrer">Open Lab</a></strong> takes care of running your experiment and collecting, storing and managing data. It supports collaboration in projects, customization of task parameters and invitation of participants. The basic version of the application is available for free. </p>
    <OpenLabWidget
      ref={ widget }
    />
  </Confirm>
}

export default ExportOpenLab
