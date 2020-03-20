import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import { createPointsSelector } from 'redux/tracks/points'
import { selectTrack } from 'redux/flightProfiles'
import { calculateFlightProfile } from './utils'

const FlightProfile = ({ chart, trackId }) => {
  const points = useSelector(createPointsSelector(trackId))
  const track = useSelector(state => selectTrack(state, trackId))
  const flightProfilePoints = useMemo(() => calculateFlightProfile(points), [points])

  if (!track || !flightProfilePoints) return null

  const tooltip = {
    headerFormat: `
      <span style="font-size: 14px">{series.name}</span><br/>
      <span style="font-size: 12px">{series.options.place}</span><br/>
    `,
    pointFormat: `
      <span style="color: transparent">-</span><br/>
      <span style="font-size: 16px">↓{point.y} →{point.x}</span><br/>
      <span style="color: transparent">-</span><br/>
      <span><b>Ground speed:</b> {point.hSpeed} ${I18n.t('units.kmh')}</span><br/>
      <span><b>Vertical speed:</b> {point.vSpeed} ${I18n.t('units.kmh')}</span><br/>
    `
  }

  const name = `${track.pilotName} - #${trackId}`

  return (
    <Highchart.Series
      chart={chart}
      data={flightProfilePoints}
      tooltip={tooltip}
      name={name}
      place={track.placeName}
    />
  )
}

FlightProfile.propTypes = {
  chart: PropTypes.object,
  trackId: PropTypes.number.isRequired
}

export default FlightProfile
