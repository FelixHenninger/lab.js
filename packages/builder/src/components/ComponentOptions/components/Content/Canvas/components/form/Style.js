import React from 'react'

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
    <StrokeWidthDropdown
      onChange={ value => changeHandler('strokeWidth', value) }
      disabled={ ['image', 'aoi', undefined].includes(selection.type) }
    />
    <ColorDropdown
      name="stroke"
      icon="circle" iconFallbackWeight="r"
      disabled={ ['image', 'aoi', undefined].includes(selection.type) }
    />
    <ColorDropdown
      name="fill"
      icon="circle" iconFallbackWeight="s"
      disabled={ ['line', 'image', 'aoi', undefined].includes(selection.type) }
    />
  </ButtonGroup>
