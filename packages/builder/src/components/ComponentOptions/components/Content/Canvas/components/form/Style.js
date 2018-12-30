import React from 'react'

import { Control } from 'react-redux-form'
import { ButtonGroup } from 'reactstrap'

import ColorDropdown from './ColorDropDown'
import StrokeWidthDropdown from './StrokeWidthDropDown'
import Details from './Details'

export default ({ selection, changeHandler }) =>
  <ButtonGroup className="ml-2">
    <Details
      selection={ selection }
      changeHandler={ changeHandler }
    />
    <Control
      model=".strokeWidth"
      component={ StrokeWidthDropdown }
      controlProps={{
        disabled: ['image', undefined].includes(selection.type),
      }}
    />
    <Control
      model=".stroke"
      component={ ColorDropdown }
      controlProps={{
        icon: 'circle',
        iconFallbackWeight: 'r',
        disabled: ['image', undefined].includes(selection.type),
      }}
    />
    <Control
      model=".fill"
      component={ ColorDropdown }
      controlProps={{
        icon: 'circle',
        iconWeight: 's',
        disabled: ['line', 'image', undefined].includes(selection.type),
      }}
    />
  </ButtonGroup>
