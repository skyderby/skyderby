import React from 'react'
import PropTypes from 'prop-types'

import Trajectory from './Trajectory'
import Marker from './Marker'

import { afterExitColor, windowStartColor, windowEndColor } from '../../constants'

const FlightPath = props => {
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

FlightPath.propTypes = {
  color: PropTypes.string.isRequired,
  points: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.string.isRequired,
      longitude: PropTypes.string.isRequired
    })
  ).isRequired,
  afterExitPoint: PropTypes.shape({
    latitude: PropTypes.string.isRequired,
    longitude: PropTypes.string.isRequired
  }).isRequired,
  startPoint: PropTypes.shape({
    latitude: PropTypes.string.isRequired,
    longitude: PropTypes.string.isRequired
  }).isRequired,
  endPoint: PropTypes.shape({
    latitude: PropTypes.string.isRequired,
    longitude: PropTypes.string.isRequired
  }).isRequired,
  map: PropTypes.object.isRequired
}

export default FlightPath
