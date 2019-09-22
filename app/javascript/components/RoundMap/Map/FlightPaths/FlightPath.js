import React from 'react'

import Trajectory from './Trajectory'
import Marker from './Marker'

import {
  afterExitColor,
  windowStartColor,
  windowEndColor
} from 'components/RoundMap/constants'

const FlightPath = props => {
  const { color, points, afterExitPoint, startPoint, endPoint } = props

  return (
    <>
      <Trajectory color={color} points={points} />
      <Marker color={windowStartColor} {...startPoint} />
      <Marker color={windowEndColor} {...endPoint} />
      <Marker color={afterExitColor} {...afterExitPoint} />
    </>
  )
}

export default FlightPath
