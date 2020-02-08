import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { selectTrack } from 'redux/tracks'
import { selectPoints } from 'redux/tracks/points'
import { selectWindData } from 'redux/tracks/windData'
import { subtractWind } from 'utils/windCancellation'
import { usePageContext } from 'components/PageContext'
import RangeSlider from 'components/RangeSlider'
import Header from './Header'
import Summary from './Summary'
import Charts from './Charts'
import ViewSettings from './ViewSettings'
import { getMinMaxAltitude } from './minMaxAltitude'
import { PageContainer, TrackDataContainer } from './elements'
import { cropPoints } from './pointsFilter'
import useSyncParamsToUrl from './useSyncParamsToUrl'
import useSelectedAltitudeRange from './useSelectedAltitudeRange'

const TrackShow = () => {
  const {
    trackId,
    altitudeFrom: initialAltitudeFrom,
    altitudeTo: initialAltitudeTo,
    straightLine: initialStraightLine
  } = usePageContext()

  const track = useSelector(state => selectTrack(state, trackId))
  const points = useSelector(state => selectPoints(state, trackId))
  const windData = useSelector(state => selectWindData(state, trackId))

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

  if (!track) return null

  return (
    <PageContainer>
      <Header track={track} />
      <TrackDataContainer>
        <ViewSettings straightLine={straightLine} setStraightLine={setStraightLine} />

        <Summary
          selectedPoints={selectedPoints}
          zeroWindPoints={zeroWindPoints}
          straightLine={straightLine}
        />

        <hr />

        <RangeSlider
          domain={trackAltitudeRange || [0, 1]}
          values={selectedAltitudeRange}
          onChange={handleAltitudeRangeChange}
          step={50}
        />

        <Charts points={selectedPoints} />
      </TrackDataContainer>
    </PageContainer>
  )
}

export default TrackShow
