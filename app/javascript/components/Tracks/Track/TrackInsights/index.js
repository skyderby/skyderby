import React, { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useTrackQuery } from 'api/hooks/tracks'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useTrackWindDataQuery } from 'api/hooks/tracks/windData'
import { subtractWind } from 'utils/windCancellation'
import { cropPoints } from 'utils/pointsFilter'
import RangeSlider from 'components/RangeSlider'
import PageContainer from 'components/Tracks/Track/PageContainer'
import Summary from './Summary'
import Charts from 'components/TrackCharts'
import ViewSettings from './ViewSettings'
import RangeShortcuts from './RangeShortcuts'
import { getMinMaxAltitude } from './minMaxAltitude'

const TrackInsights = ({ trackId }) => {
  const history = useHistory()
  const location = useLocation()
  const { data: track } = useTrackQuery(trackId)
  const { data: points = [] } = useTrackPointsQuery(trackId)
  const { data: windData = [] } = useTrackWindDataQuery(trackId)

  const [minAltitude, maxAltitude] = useMemo(() => getMinMaxAltitude(points), [points])

  const urlParams = new URLSearchParams(location.search)
  const altitudeFromParam = urlParams.get('f') && Number(urlParams.get('f'))
  const altitudeToParam = urlParams.get('t') && Number(urlParams.get('t'))
  const straightLine = urlParams.get('straight-line') === 'true'

  const setStraightLine = value => {
    const params = new URLSearchParams(location.search)
    if (value === true) {
      params.set('straight-line', 'true')
    } else {
      params.delete('straight-line')
    }
    history.replace({ pathname: location.pathname, search: params.toString() })
  }

  const altitudeFrom = altitudeFromParam
    ? Math.min(maxAltitude, altitudeFromParam)
    : maxAltitude

  const altitudeTo = altitudeToParam
    ? Math.max(minAltitude, altitudeToParam)
    : minAltitude

  const handleAltitudeRangeChange = ([valueFrom, valueTo]) => {
    if (altitudeFrom === valueFrom && altitudeTo === valueTo) return

    const params = new URLSearchParams(location.search)
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

    history.replace({ pathname: location.pathname, search: params.toString() })
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
    <PageContainer>
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
    </PageContainer>
  )
}

TrackInsights.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default TrackInsights
