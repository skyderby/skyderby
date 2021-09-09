import React, { useMemo } from 'react'
import { Chart, Point } from 'highcharts'

import { useTrackQuery } from 'api/hooks/tracks'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useProfileQuery } from 'api/hooks/profiles'
import { I18n } from 'components/TranslationsProvider'
import Highchart from 'components/Highchart'
import { calculateFlightProfile } from 'components/FlightProfiles/utils'
import { usePlaceQuery } from 'api/hooks/places'

const headerFormat = `
  <span style="font-size: 14px">{series.name}</span><br/>
  <span style="font-size: 12px">{series.options.place}</span><br/>
`

const pointFormatter = function (this: Point) {
  return `
    <span style="color: transparent">-</span><br/>
    <span style="font-size: 16px">↓${Math.round(this.y ?? 0)}
      ${I18n.t('units.m')} →${Math.round(this.x)} ${I18n.t('units.m')}</span><br/>
    <span style="color: transparent">-</span><br/>
    <span>
        <b>Ground speed:</b> ${this.options.custom?.hSpeed} ${I18n.t('units.kmh')}
    </span><br/>
    <span>
        <b>Vertical speed:</b> ${this.options.custom?.vSpeed} ${I18n.t('units.kmh')}
    </span><br/>`
}

const tooltip = { headerFormat, pointFormatter }

type FlightProfileProps = {
  chart: Chart
  trackId: number
  straightLine: boolean
  color: string
}

const FlightProfile = ({
  chart,
  trackId,
  straightLine,
  ...props
}: FlightProfileProps): JSX.Element | null => {
  const { data: points = [] } = useTrackPointsQuery(trackId)
  const { data: track } = useTrackQuery(trackId)
  const { data: profile } = useProfileQuery(track?.profileId, { enabled: false })
  const { data: place } = usePlaceQuery(track?.placeId, { enabled: false })
  const flightProfilePoints = useMemo(
    () => calculateFlightProfile(points, straightLine),
    [points, straightLine]
  )

  if (!track || !flightProfilePoints) return null

  const name = `${profile?.name || track.pilotName} - #${trackId}`
  const placeName = place?.name ?? track.location

  return (
    <Highchart.Series
      chart={chart}
      type="spline"
      data={flightProfilePoints}
      tooltip={tooltip}
      name={name}
      custom={{
        place: placeName
      }}
      {...props}
    />
  )
}

export default FlightProfile
