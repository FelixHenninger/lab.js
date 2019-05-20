import React from 'react'
import PropTypes from 'prop-types'

import { Layer, Group, Text, Line, Rect } from 'react-konva'
import { range } from 'lodash'

import colors from './colors'

const floor = (x, digits) => Math.floor(x / 10**digits) * 10**digits

const label = (t, zoom) =>
  zoom === 0
    ? `${ t }ms`
    : `${ t/1000 }s`

const BackgroundLayer = (
  { gridWidth=100 },
  { range: timeline, height, toX, zoom }
) =>
  <Layer>
    {
      range(
        // Background blocks must start at t with an even number of digits
        // FIXME: Here be dragons
        floor(timeline.min - gridWidth * 10**zoom, zoom + 2),
        timeline.max + gridWidth,
        gridWidth * 10**zoom
      ).map((t, i) =>
        <Group key={ `t-${ t }` }>
          <Rect
            x={ toX(t) + 0.5 }
            y={ 0 }
            width={ gridWidth }
            height={ height }
            fill={ i % 2 === 0 ? 'white' : colors.gray  }
          />
          <Text
            text={ label(t, zoom) }
            x={ toX(t) + 6 }
            y={ height - 15 }
            fontFamily="Fira Sans"
            fontSize={ 10 }
            fill={ colors.muted }
            align="left"
            verticalAlign="bottom"
          />
          <Line
            x={ toX(t) + 0.5 }
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
  zoom: PropTypes.number,
  toX: PropTypes.func,
  height: PropTypes.number,
  padding: PropTypes.number,
}

export default BackgroundLayer
