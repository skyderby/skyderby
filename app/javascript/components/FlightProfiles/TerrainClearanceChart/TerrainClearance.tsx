import React from 'react'
import type { Chart, Point } from 'highcharts'

import { I18n } from 'components/TranslationsProvider'
import Highchart from 'components/Highchart'
import { calculateTerrainClearance } from 'components/FlightProfiles/utils'
import { useTrackQuery } from 'api/tracks'
import { useProfileQuery } from 'api/profiles'
import { usePlaceQuery } from 'api/places'
import { useTrackPointsQuery } from 'api/tracks/points'
import { useTerrainProfileMeasurementQuery } from 'api/terrainProfileMeasurements'

const headerFormat = `
  <span style="font-size: 14px">{series.name}</span><br/>
  <span style="font-size: 12px">{series.options.place}</span><br/>
`

const pointFormatter = function (this: Point): string {
  return `
    <span style="margin-top: 10px"><b>${I18n.t('flight_profiles.distance_traveled')}:</b>
      ${Math.round(this.x)} ${I18n.t('units.m')}</span><br/>
    <span><b>${I18n.t('flight_profiles.distance_to_terrain')}:</b>
      ${this.options.custom?.presentation} ${I18n.t('units.m')}</span><br/>
  `
}

const tooltip = { headerFormat, pointFormatter }

type TerrainClearanceProps = {
  chart: Chart
  trackId: number
  terrainProfileId: number
  straightLine: boolean
  color: string
}

const TerrainClearance = ({
  chart,
  trackId,
  terrainProfileId,
  straightLine,
  ...props
}: TerrainClearanceProps): JSX.Element | null => {
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
      type="spline"
      data={chartPoints}
      name={name}
      custom={{
        place: place?.name
      }}
      tooltip={tooltip}
      {...props}
    />
  )
}

export default TerrainClearance
