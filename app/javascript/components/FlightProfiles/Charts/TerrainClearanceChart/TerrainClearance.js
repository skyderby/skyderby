import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import { createPointsSelector } from 'redux/tracks/points'
import { createMeasurementsSelector } from 'redux/terrainProfiles/measurements'
import { calculateTerrainClearance } from 'utils/flightProfiles'

const TerrainClearance = ({ chart, trackId, terrainProfileId, ...props }) => {
  const points = useSelector(createPointsSelector(trackId))
  const measurements = useSelector(createMeasurementsSelector(terrainProfileId))

  if (!points || !measurements) return null

  const chartPoints = calculateTerrainClearance(points, measurements)

  return <Highchart.Series chart={chart} data={chartPoints} {...props} />
}

TerrainClearance.propTypes = {
  chart: PropTypes.object,
  trackId: PropTypes.number.isRequired,
  terrainProfileId: PropTypes.number.isRequired
}

export default TerrainClearance
