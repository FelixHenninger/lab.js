import React from 'react'

import Text from './components/Text'
import Divider from './components/Divider'
import Input from './components/Input'

const selectItem = (type) => {
  switch(type) {
    case 'text':
      return Text
    case 'divider':
      return Divider
    case 'input':
      return Input
    default:
      return null
  }
}

export default ({ type, data }) => {
  const Item = selectItem(type)
  return <Item data={ data } />
}
