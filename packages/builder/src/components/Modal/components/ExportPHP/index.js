import React from 'react'
import { useStore } from 'react-redux'

import { Alert } from 'reactstrap'
import Confirm from '../Confirm'

import downloadStaticPHP from '../../../../logic/io/export/modifiers/php'

const ExportPHP = ({ closeHandler }) => {
  const store = useStore()

  return (
    <Confirm
      title={ <span>Export with <code>PHP</code> backend</span> }
      confirmLabel="Continue to download"
      confirmHandler={ () => {
        downloadStaticPHP(store.getState())
        closeHandler()
      } }
      closeHandler={ closeHandler }
    >
      <p><strong>You are about to download the study with a <code>PHP</code> backend.</strong> It contains code that will run on your server and collect the data as it accumulates.</p>
      <Alert color="danger">
        <strong>Though we do our best, we cannot take responsibility for code the runs on your server.</strong> Please make sure to <a href="http://labjs.readthedocs.io/en/latest/learn/deploy/" className="alert-link font-weight-bold" target="_blank" rel="noopener noreferrer">consult the documentation on how to set up data collection correctly</a>, and ask your friendly neighborhood IT staff if you're unsure.
      </Alert>
    </Confirm>
  )
}

export default ExportPHP
