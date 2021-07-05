import React from 'react'
import PropTypes from 'prop-types'

import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import TrackCharts from 'components/TrackCharts/CombinedChart'
import Highchart from 'components/Highchart'

const breakoffAltitude = 1707 // 5600 ft
const windowHeight = 2256 // 7400 ft

const findPositionForAltitude = (points, altitude) => {
  const idx = points.findIndex(point => point.altitude <= altitude)
  const firstPoint = points[idx]
  const secondPoint = points[idx + 1]

  const flTime =
    firstPoint.flTime +
    ((secondPoint.flTime - firstPoint.flTime) /
      (firstPoint.altitude - secondPoint.altitude)) *
      (firstPoint.altitude - altitude)

  return flTime - points[0].flTime
}

const Charts = ({ result }) => {
  const { data: points = [], isLoading } = useTrackPointsQuery(result.trackId, {
    originalFrequency: true
  })

  if (isLoading) return null

  const windowEndAltitude = Math.max(3000 - windowHeight, breakoffAltitude)
  const plotLineValue = findPositionForAltitude(points, windowEndAltitude)

  return (
    <div>
      <TrackCharts points={points}>
        {chart => (
          <>
            <Highchart.Plotline
              chart={chart}
              id="windowEnd"
              value={plotLineValue}
              color="red"
              label={{ text: 'End of window', style: { color: 'red' } }}
            />
          </>
        )}
      </TrackCharts>
    </div>
  )
}

Charts.propTypes = {
  result: PropTypes.shape({
    trackId: PropTypes.number.isRequired
  }).isRequired
}

export default Charts
