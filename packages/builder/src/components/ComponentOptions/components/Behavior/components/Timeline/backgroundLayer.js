import React from 'react'
import PropTypes from 'prop-types'

import { Layer, Group, Text, Line, Rect } from 'react-konva'
import { range } from 'lodash'

import colors from './colors'

const BackgroundLayer = (_, { height, padding }) =>
  <Layer>
    {
      range(-1, 20).map(i =>
        <Group key={ `t-${ i }` }>
          <Rect
            x={ padding + i * 100 + 0.5 }
            y={ 0 }
            width={ 100 }
            height={ height }
            fill={ i % 2 === 0 ? 'white' : colors.gray }
          />
          <Text
            text={ `${ i * 100 }` }
            x={ padding + i * 100 + 6 }
            y={ height - 16 }
            fontFamily="Fira Sans"
            fontSize={ 10 }
            fill={ colors.muted }
            align="left"
            verticalAlign="bottom"
          />
          <Line
            x={ padding + i * 100 + 0.5 }
            y={ 0 }
            stroke={ colors.gray }
            strokeWidth={ 1 }
            points={ [0, 0, 0, height] }
          />
        </Group>
      )
    }
    <Line
      x={ 0 }
      y={ height - 0.5 }
      stroke={ colors.outline }
      strokeWidth={ 1 }
      points={ [0, 0, 2000, 0] }
    />
  </Layer>

BackgroundLayer.contextTypes = {
  height: PropTypes.number,
  padding: PropTypes.number,
}

export default BackgroundLayer
