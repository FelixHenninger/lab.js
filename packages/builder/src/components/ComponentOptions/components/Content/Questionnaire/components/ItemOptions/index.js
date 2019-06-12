import React from 'react'

import Text from './components/Text'
import Divider from './components/Divider'
import Input from './components/Input'
import Radio from './components/Radio'
import Checkbox from './components/Checkbox'

const selectItem = (type) => {
  switch(type) {
    case 'text':
      return Text
    case 'divider':
      return Divider
    case 'input':
    case 'textarea':
      return Input
    case 'radio':
      return Radio
    case 'checkbox':
      return Checkbox
    default:
      return null
  }
}

export default ({ type, data }) => {
  const Item = selectItem(type)
  return <Item data={ data } />
}
