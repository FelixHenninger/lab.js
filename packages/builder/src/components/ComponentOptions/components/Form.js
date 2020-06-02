import React from 'react'
import { connect } from 'react-redux'

import { Formik } from 'formik'
import { pick } from 'lodash'

import { AutoSave } from '../../Form'
import { updateComponent } from '../../../actions/components'

const Form = ({
  id, data, keys,
  updateComponent,
  postProcess=d => d,
  children,
}) =>
  <Formik
    initialValues={ pick(data, keys) }
    enableReinitialize={ true }
  >
    <>
      { children }
      <AutoSave onSave={ data => updateComponent(id, postProcess(data)) } />
    </>
  </Formik>

const mapDispatchToProps = {
  updateComponent
}

export default connect(null, mapDispatchToProps)(Form)
