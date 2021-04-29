import React from 'react'
import PropTypes from 'prop-types'

import { I18n } from 'components/TranslationsProvider'
import Highchart from 'components/Highchart'
import { calculateTerrainClearance } from 'components/FlightProfiles/utils'
import { useTrackQuery } from 'api/hooks/tracks'
import { useProfileQuery } from 'api/hooks/profiles'
import { usePlaceQuery } from 'api/hooks/places'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useTerrainProfileMeasurementQuery } from 'api/hooks/terrainProfileMeasurements'

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
  const { data: track } = useTrackQuery(trackId)
  const { data: profile } = useProfileQuery(track?.profileId)
  const { data: place } = usePlaceQuery(track?.placeId)
  const { data: points } = useTrackPointsQuery(trackId)
  const { data: measurements } = useTerrainProfileMeasurementQuery(terrainProfileId)

  if (!track || !points || !measurements) return null

  const chartPoints = calculateTerrainClearance(points, measurements, straightLine)

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
