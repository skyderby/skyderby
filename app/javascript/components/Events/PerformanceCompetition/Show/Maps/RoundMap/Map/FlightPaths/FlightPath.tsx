import React from 'react'

import Trajectory from './Trajectory'
import Marker from './Marker'

import { afterExitColor, windowStartColor, windowEndColor } from '../../constants'

interface FlightPathPoint {
  latitude: number
  longitude: number
}

type FlightPathProps = {
  color: string
  points: FlightPathPoint[]
  afterExitPoint: FlightPathPoint
  startPoint: FlightPathPoint
  endPoint: FlightPathPoint
  map: google.maps.Map | undefined
}

const FlightPath = (props: FlightPathProps) => {
  const { color, points, afterExitPoint, startPoint, endPoint, map } = props

  return (
    <>
      <Trajectory color={color} points={points} map={map} />
      <Marker color={windowStartColor} {...startPoint} map={map} />
      <Marker color={windowEndColor} {...endPoint} map={map} />
      <Marker color={afterExitColor} {...afterExitPoint} map={map} />
    </>
  )
}

export default FlightPath
