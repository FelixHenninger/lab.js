import React from 'react'
import PropTypes from 'prop-types'
import Confirm from '../Confirm'

import OpenLabWidget from './widget'

const ExportOpenLab = ({ closeHandler }, { store }) =>
  <Confirm
    title={ <span>Upload to Open Lab</span> }
    closeLabel="Close"
    closeHandler={ closeHandler }
    confirmLabel="Upload"
    confirmHandler={ () => {
      this._openLabWidget.submit()
    } }
  >
    <p><strong><a href="https://www.openlab.online/" target="_blank" rel="noopener noreferrer">Open Lab</a></strong> takes care of running your experiment and collecting, storing and managing data. It supports collaboration in projects, customization of task parameters and invitation of participants. The basic version of the application is available for free. </p>
    <OpenLabWidget
      ref={ widget => this._openLabWidget = widget }
    />
  </Confirm>

ExportOpenLab.contextTypes = {
  store: PropTypes.object
}

export default ExportOpenLab
