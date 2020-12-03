import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { I18n } from 'components/TranslationsProvider'
import Highchart from 'components/Highchart'
import { createPointsSelector } from 'redux/tracks/points'
import { createTrackSelector } from 'redux/tracks'
import { createProfileSelector } from 'redux/profiles'
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
  const points = useSelector(createPointsSelector(trackId))
  const track = useSelector(createTrackSelector(trackId))
  const profile = useSelector(createProfileSelector(track?.profileId))
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
