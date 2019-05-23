import React from 'react'

import Text from './components/Text'

const selectItem = (type) => {
  switch(type) {
    case 'text':
      return Text
    default:
      return null
  }
}

export default ({ type, data }) => {
  const Item = selectItem(type)
  return <Item data={ data } />
}
