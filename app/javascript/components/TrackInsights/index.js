import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import { useTrackQuery } from 'api/hooks/tracks'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useTrackWindDataQuery } from 'api/hooks/tracks/windData'
import { subtractWind } from 'utils/windCancellation'
import { cropPoints } from 'utils/pointsFilter'
import RangeSlider from 'components/RangeSlider'
import TrackShowContainer from 'components/TrackShowContainer'
import Summary from './Summary'
import Charts from './Charts'
import ViewSettings from './ViewSettings'
import RangeShortcuts from './RangeShortcuts'
import { getMinMaxAltitude } from './minMaxAltitude'

const TrackInsights = ({ match, history, location: { pathname, search } }) => {
  const trackId = Number(match.params.id)
  const { data: track } = useTrackQuery(trackId)
  const { data: points = [] } = useTrackPointsQuery(trackId)
  const { data: windData = [] } = useTrackWindDataQuery(trackId)

  const [minAltitude, maxAltitude] = useMemo(() => getMinMaxAltitude(points), [points])

  const urlParams = new URLSearchParams(search)
  const altitudeFromParam = urlParams.get('f') && Number(urlParams.get('f'))
  const altitudeToParam = urlParams.get('t') && Number(urlParams.get('t'))
  const straightLine = urlParams.get('straight-line') === 'true'

  const setStraightLine = value => {
    const params = new URLSearchParams(search)
    if (value === true) {
      params.set('straight-line', 'true')
    } else {
      params.delete('straight-line')
    }
    history.replace({ pathname, search: params.toString() })
  }

  const altitudeFrom = altitudeFromParam
    ? Math.min(maxAltitude, altitudeFromParam)
    : maxAltitude

  const altitudeTo = altitudeToParam
    ? Math.max(minAltitude, altitudeToParam)
    : minAltitude

  const handleAltitudeRangeChange = ([valueFrom, valueTo]) => {
    if (altitudeFrom === valueFrom && altitudeTo === valueTo) return

    const params = new URLSearchParams(search)
    if (valueFrom === maxAltitude) {
      params.delete('f')
    } else {
      params.set('f', valueFrom)
    }
    if (valueTo === minAltitude) {
      params.delete('t')
    } else {
      params.set('t', valueTo)
    }

    history.replace({ pathname, search: params.toString() })
  }

  const selectedPoints = useMemo(() => cropPoints(points, altitudeFrom, altitudeTo), [
    points,
    altitudeFrom,
    altitudeTo
  ])

  const zeroWindPoints = useMemo(() => subtractWind(selectedPoints, windData), [
    selectedPoints,
    windData
  ])

  return (
    <TrackShowContainer>
      <ViewSettings straightLine={straightLine} setStraightLine={setStraightLine} />

      <Summary
        selectedPoints={selectedPoints}
        zeroWindPoints={zeroWindPoints}
        straightLine={straightLine}
      />

      <hr />

      <RangeSlider
        reversed
        domain={[minAltitude, maxAltitude]}
        values={[altitudeTo, altitudeFrom]}
        onChange={handleAltitudeRangeChange}
        step={50}
      />

      <RangeShortcuts
        activity={track.kind}
        altitudeRange={[minAltitude, maxAltitude]}
        selectedAltitudeRange={[altitudeFrom, altitudeTo]}
        onChange={handleAltitudeRangeChange}
      />

      <Charts points={selectedPoints} zeroWindPoints={zeroWindPoints} />
    </TrackShowContainer>
  )
}

TrackInsights.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired
  }).isRequired
}

export default TrackInsights
