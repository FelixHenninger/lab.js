import React from 'react'

import Text from './components/Text'
import Divider from './components/Divider'
import Input from './components/Input'
import Radio from './components/Radio'

const selectItem = (type) => {
  switch(type) {
    case 'text':
      return Text
    case 'divider':
      return Divider
    case 'input':
      return Input
    case 'radio':
      return Radio
    default:
      return null
  }
}

export default ({ type, data }) => {
  const Item = selectItem(type)
  return <Item data={ data } />
}
