import React from 'react'
import { useStore } from 'react-redux'

import Confirm from '../Confirm'
import downloadStaticPM from '../../../../logic/io/export/modifiers/postMessage'

const ExportPM = ({ closeHandler }) => {
  const store = useStore()

  return (
    <Confirm
      title={ <span>Export for <strong>generic survey software</strong></span> }
      confirmLabel="Continue to download"
      confirmHandler={ () => {
        downloadStaticPM(store.getState())
        closeHandler()
      } }
      closeHandler={ closeHandler }
    >
      <p><strong>The copy you're about to download is set up to work with most third-party survey tools</strong> (e.g. <a href="https://www.limesurvey.org/" target="_blank" rel="noopener noreferrer">LimeSurvey</a>, <a href="https://qualtrics.com/" target="_blank" rel="noopener noreferrer">Qualtrics</a> or <a href="https://www.soscisurvey.com/" target="_blank" rel="noopener noreferrer">SoSci</a>). This is useful if you're planning to run the study you're building as part of a survey or a larger questionnaire.</p>
      <p>Please check out our documentation to <a href="https://labjs.readthedocs.io/en/latest/learn/deploy/3-third-party.html" target="_blank" rel="noopener noreferrer">find out how to use <code>lab.js</code> in combination with third-party software</a>.</p>
    </Confirm>
  )
}

export default ExportPM
