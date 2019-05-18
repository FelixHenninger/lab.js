import React from 'react'
import PropTypes from 'prop-types'

import { Layer, Group, Text, Line, Rect } from 'react-konva'
import { range } from 'lodash'

import colors from './colors'

const BackgroundLayer = (
  { gridWidth=100 },
  { range: timeline, height }
) =>
  <Layer>
    {
      range(timeline.min, timeline.max + gridWidth, gridWidth).map((t, i) =>
        <Group key={ `t-${ t }` }>
          <Rect
            x={ t + 0.5 }
            y={ 0 }
            width={ gridWidth }
            height={ height }
            fill={ i % 2 === 0 ? 'white' : colors.gray }
          />
          <Text
            text={ `${ t }` }
            x={ t + 6 }
            y={ height - 15 }
            fontFamily="Fira Sans"
            fontSize={ 10 }
            fill={ colors.muted }
            align="left"
            verticalAlign="bottom"
          />
          <Line
            x={ t + 0.5 }
            y={ 0 }
            stroke={ colors.gray }
            strokeWidth={ 1 }
            points={ [0, 0, 0, height] }
          />
        </Group>
      )
    }
  </Layer>

BackgroundLayer.contextTypes = {
  range: PropTypes.object,
  height: PropTypes.number,
  padding: PropTypes.number,
}

export default BackgroundLayer
