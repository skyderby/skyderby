import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import { createTrackSelector } from 'redux/tracks'
import { createProfileSelector } from 'redux/profiles'
import { createPointsSelector } from 'redux/tracks/points'
import { createMeasurementsSelector } from 'redux/terrainProfileMeasurements'
import { calculateTerrainClearance } from 'utils/flightProfiles'

const TerrainClearance = ({ chart, trackId, terrainProfileId, ...props }) => {
  const track = useSelector(createTrackSelector(trackId))
  const profile = useSelector(createProfileSelector(track?.profileId))
  const points = useSelector(createPointsSelector(trackId))
  const measurements = useSelector(createMeasurementsSelector(terrainProfileId))

  if (!track || !points || !measurements) return null

  const chartPoints = calculateTerrainClearance(points, measurements.records)

  const name = `${profile?.name || track.pilotName} - #${trackId}`

  return <Highchart.Series chart={chart} data={chartPoints} name={name} {...props} />
}

TerrainClearance.propTypes = {
  chart: PropTypes.object,
  trackId: PropTypes.number.isRequired,
  terrainProfileId: PropTypes.number.isRequired
}

export default TerrainClearance
