import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import { useTrackQuery } from 'api/hooks/tracks'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useProfileQuery } from 'api/hooks/profiles'
import { I18n } from 'components/TranslationsProvider'
import Highchart from 'components/Highchart'
import { calculateFlightProfile } from 'components/FlightProfiles/utils'

const headerFormat = `
  <span style="font-size: 14px">{series.name}</span><br/>
  <span style="font-size: 12px">{series.options.place}</span><br/>
`

const pointFormatter = function () {
  return `
    <span style="color: transparent">-</span><br/>
    <span style="font-size: 16px">↓${Math.round(this.y)}
      ${I18n.t('units.m')} →${Math.round(this.x)} ${I18n.t('units.m')}</span><br/>
    <span style="color: transparent">-</span><br/>
    <span><b>Ground speed:</b> ${this.hSpeed} ${I18n.t('units.kmh')}</span><br/>
    <span><b>Vertical speed:</b> ${this.vSpeed} ${I18n.t('units.kmh')}</span><br/>`
}

const tooltip = { headerFormat, pointFormatter }

const FlightProfile = ({ chart, trackId, straightLine, ...props }) => {
  const { data: points = [] } = useTrackPointsQuery(trackId)
  const { data: track } = useTrackQuery(trackId)
  const { data: profile } = useProfileQuery(track?.profileId)
  const flightProfilePoints = useMemo(
    () => calculateFlightProfile(points, straightLine),
    [points, straightLine]
  )

  if (!track || !flightProfilePoints) return null

  const name = `${profile?.name || track.pilotName} - #${trackId}`

  return (
    <Highchart.Series
      chart={chart}
      data={flightProfilePoints}
      tooltip={tooltip}
      name={name}
      place={track.placeName}
      {...props}
    />
  )
}

FlightProfile.propTypes = {
  chart: PropTypes.object,
  trackId: PropTypes.number.isRequired,
  straightLine: PropTypes.bool.isRequired
}

export default FlightProfile
