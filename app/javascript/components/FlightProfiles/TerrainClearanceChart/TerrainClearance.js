import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { I18n } from 'components/TranslationsProvider'
import Highchart from 'components/Highchart'
import { createTrackSelector } from 'redux/tracks'
import { createProfileSelector } from 'redux/profiles'
import { createPlaceSelector } from 'redux/places'
import { createPointsSelector } from 'redux/tracks/points'
import { createMeasurementsSelector } from 'redux/terrainProfileMeasurements'
import { calculateTerrainClearance } from 'components/FlightProfiles/utils'

const headerFormat = `
  <span style="font-size: 14px">{series.name}</span><br/>
  <span style="font-size: 12px">{series.options.place}</span><br/>
`

const pointFormatter = function () {
  return `
    <span style="margin-top: 10px"><b>${I18n.t('flight_profiles.distance_traveled')}:</b>
      ${Math.round(this.x)} ${I18n.t('units.m')}</span><br/>
    <span><b>${I18n.t('flight_profiles.distance_to_terrain')}:</b>
      ${this.presentation} ${I18n.t('units.m')}</span><br/>
  `
}

const tooltip = { headerFormat, pointFormatter }

const TerrainClearance = ({
  chart,
  trackId,
  terrainProfileId,
  straightLine,
  ...props
}) => {
  const track = useSelector(createTrackSelector(trackId))
  const profile = useSelector(createProfileSelector(track?.profileId))
  const place = useSelector(createPlaceSelector(track?.placeId))
  const points = useSelector(createPointsSelector(trackId))
  const measurements = useSelector(createMeasurementsSelector(terrainProfileId))

  if (!track || !points || !measurements) return null

  const chartPoints = calculateTerrainClearance(
    points,
    measurements.records,
    straightLine
  )

  const name = `${profile?.name || track.pilotName} - #${trackId}`

  return (
    <Highchart.Series
      chart={chart}
      data={chartPoints}
      name={name}
      place={place?.name}
      tooltip={tooltip}
      {...props}
    />
  )
}

TerrainClearance.propTypes = {
  chart: PropTypes.object,
  trackId: PropTypes.number.isRequired,
  terrainProfileId: PropTypes.number.isRequired,
  straightLine: PropTypes.bool.isRequired
}

export default TerrainClearance
