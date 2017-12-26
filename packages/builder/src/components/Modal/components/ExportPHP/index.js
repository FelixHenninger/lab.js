import React from 'react'
import PropTypes from 'prop-types'
import { Alert } from 'reactstrap'
import Confirm from '../Confirm'

import exportStaticPHP from '../../../../logic/io/export/modifiers/php'

const ExportPHP = ({ closeHandler }, { store }) =>
  <Confirm
    title={ <span>Export with <code>PHP</code> backend</span> }
    confirmLabel="Continue to download"
    confirmHandler={ () => {
      exportStaticPHP(store.getState())
      closeHandler()
    } }
    closeHandler={ closeHandler }
  >
    <p><strong>You are about to download the study with at <code>PHP</code> backend.</strong> It contains code that will run on your server and collect the data as it accumulates.</p>
    <Alert color="danger">
      <strong>Though we do our best, we cannot take responsibility for code the runs on your server.</strong> Please make sure to <a href="http://labjs.readthedocs.io/en/latest/learn/deploy/" className="alert-link" style={{ fontWeight: 600 }}>consult the documentation on how to set up data collection correctly</a>, and ask your friendly neighborhood IT staff if you're unsure.
    </Alert>
  </Confirm>

ExportPHP.contextTypes = {
  store: PropTypes.object
}

export default ExportPHP
