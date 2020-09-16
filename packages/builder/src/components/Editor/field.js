import React from 'react'
import { useField } from 'formik'

import Editor from './index'

export default ({ name, ...props }) => {
  const [field, , helpers] = useField(name)

  return <Editor
    value={ field.value }
    onChange={ helpers.setValue }
    {...props}
  />
}
