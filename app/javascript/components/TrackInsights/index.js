import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { createPointsSelector } from 'redux/tracks/points'
import { createWindDataSelector } from 'redux/tracks/windData'
import { subtractWind } from 'utils/windCancellation'
import { cropPoints } from 'utils/pointsFilter'
import RangeSlider from 'components/RangeSlider'
import { usePageContext } from 'components/PageContext'
import Summary from './Summary'
import Charts from './Charts'
import ViewSettings from './ViewSettings'
import { getMinMaxAltitude } from './minMaxAltitude'
import useSelectedAltitudeRange from './useSelectedAltitudeRange'
import useSyncParamsToUrl from './useSyncParamsToUrl'

const TrackInsights = () => {
  const {
    trackId,
    altitudeFrom: initialAltitudeFrom,
    altitudeTo: initialAltitudeTo,
    straightLine: initialStraightLine
  } = usePageContext()

  const points = useSelector(createPointsSelector(trackId))
  const windData = useSelector(createWindDataSelector(trackId))

  const trackAltitudeRange = useMemo(() => getMinMaxAltitude(points), [points])

  const [straightLine, setStraightLine] = useState(initialStraightLine)
  const [selectedAltitudeRange, setSelectedAltitudeRange] = useSelectedAltitudeRange(
    [initialAltitudeFrom, initialAltitudeTo],
    trackAltitudeRange
  )

  useSyncParamsToUrl({ straightLine, selectedAltitudeRange, trackAltitudeRange })

  const handleAltitudeRangeChange = ([valueFrom, valueTo]) => {
    if (!valueFrom || !valueTo) return

    setSelectedAltitudeRange([valueFrom, valueTo])
  }
  const selectedPoints = useMemo(() => cropPoints(points, ...selectedAltitudeRange), [
    points,
    selectedAltitudeRange
  ])

  const zeroWindPoints = useMemo(() => subtractWind(selectedPoints, windData), [
    selectedPoints,
    windData
  ])

  return (
    <>
      <ViewSettings straightLine={straightLine} setStraightLine={setStraightLine} />

      <Summary
        selectedPoints={selectedPoints}
        zeroWindPoints={zeroWindPoints}
        straightLine={straightLine}
      />

      <hr />

      <RangeSlider
        reversed
        domain={trackAltitudeRange || [0, 1]}
        values={selectedAltitudeRange}
        onChange={handleAltitudeRangeChange}
        step={50}
      />

      <Charts points={selectedPoints} zeroWindPoints={zeroWindPoints} />
    </>
  )
}

export default TrackInsights
