import React from 'react'
import { connect } from 'react-redux'

import { LocalForm } from 'react-redux-form'
import { pick } from 'lodash'

import { updateComponent } from '../../../actions/components'

const Form = ({
  id, data, keys, validators,
  updateComponent, getDispatch, postProcess=d => d,
  children, className, style
}) =>
  <LocalForm
    initialState={ pick(data, keys) }
    onChange={ newData => updateComponent(id, postProcess(newData)) }
    getDispatch={ getDispatch }
    className={ className }
    style={ style }
    validators={ validators }
  >
    { children }
  </LocalForm>

const mapDispatchToProps = {
  updateComponent
}

export default connect(null, mapDispatchToProps)(Form)
