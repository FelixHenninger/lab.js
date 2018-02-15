import React from 'react'
import PropTypes from 'prop-types'

import Confirm from '../Confirm'
import exportStaticPM from '../../../../logic/io/export/modifiers/postMessage'

const ExportPM = ({ closeHandler }, { store }) =>
  <Confirm
    title={ <span>Export for <strong>generic survey software</strong></span> }
    confirmLabel="Continue to download"
    confirmHandler={ () => {
      exportStaticPM(store.getState())
      closeHandler()
    } }
    closeHandler={ closeHandler }
  >
    <p><strong>The copy you're about to download is set up to work with most third-party survey tools</strong> (e.g. <a href="https://www.limesurvey.org/">LimeSurvey</a>, <a href="https://qualtrics.com/">Qualtrics</a> or <a href="https://www.soscisurvey.com/">SoSci</a>). This is useful if you're planning to run the study you're building as part of a survey or a larger questionnaire.</p>
    <p>Please check out our documentation to <a href="https://labjs.readthedocs.io/en/latest/learn/deploy/3-third-party.html">find out how to use <code>lab.js</code> in combination with third-party software</a>.</p>
  </Confirm>

ExportPM.contextTypes = {
  store: PropTypes.object
}

export default ExportPM
