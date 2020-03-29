import React from 'react'

import Text from './components/Text'
import Image from './components/Image'
import Divider from './components/Divider'
import Raw from './components/Raw'
import Input from './components/Input'
import Radio from './components/Radio'
import Checkbox from './components/Checkbox'
import Slider from './components/Slider'
import Likert from './components/Likert'

const selectItem = (type) => {
  switch(type) {
    case 'text':
      return Text
    case 'image':
      return Image
    case 'divider':
      return Divider
    case 'html':
      return Raw
    case 'input':
    case 'textarea':
      return Input
    case 'radio':
      return Radio
    case 'checkbox':
      return Checkbox
    case 'slider':
      return Slider
    case 'likert':
      return Likert
    default:
      return null
  }
}

export default (props) => {
  const Item = selectItem(props.type)
  return <Item { ...props } />
}
