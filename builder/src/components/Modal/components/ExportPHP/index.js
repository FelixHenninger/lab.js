import React from 'react'
import { Alert } from 'reactstrap'
import Confirm from '../Confirm'

import { exportStatic } from '../../../../logic/io/export'
import { phpBackendStatic, addTransmitPlugin }
  from '../../../../logic/io/export/modifiers/php'

const ExportPHP = ({ closeHandler }, { store }) =>
  <Confirm
    title={ <span>Export with <code>PHP</code> backend</span> }
    confirmLabel="Continue with download"
    confirmHandler={ () => {
      exportStatic(store.getState(), addTransmitPlugin, phpBackendStatic)
      closeHandler()
    } }
    closeHandler={ closeHandler }
  >
    <p><strong>You are about to download the study with at <code>PHP</code> backend.</strong> It contains code that will run on your server and collect the data as it accumulates.</p>
    <Alert color="danger">
      <strong>Though we do our best, we cannot take responsibility for code the runs on your server.</strong> Please make sure to consult the documentation to set up data collection correctly, and consult your friendly neighborhood IT staff if you're unsure.
    </Alert>
  </Confirm>

ExportPHP.contextTypes = {
  store: React.PropTypes.object
}

export default ExportPHP
