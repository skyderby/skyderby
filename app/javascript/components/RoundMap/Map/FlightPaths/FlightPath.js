import React from 'react'
import PropTypes from 'prop-types'

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
  }).isRequired
}

export default FlightPath
