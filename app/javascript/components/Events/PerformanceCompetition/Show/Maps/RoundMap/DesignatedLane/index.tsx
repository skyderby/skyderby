import React, { useState, useEffect, useCallback } from 'react'

import Overlay from './Overlay'
import Marker from './Marker'
import MostDistantPoint from './MostDistantPoint'
import { Competitor } from 'api/performanceCompetitions'
import useResultPoints from 'components/Events/PerformanceCompetition/useResultPoints'
import getLaneViolation from 'utils/checkLaneViolation'

type DesignatedLaneProps = {
  competitor: Competitor
}

const DesignatedLane = ({ event, competitor }: DesignatedLaneProps) => {
  const {
    points,
    afterExitPoint,
    endPoint: exitWindowPoint,
    isLoading
  } = useResultPoints(event, competitor.result)

  const initialStartPoint = afterExitPoint
  const initialEndPoint = competitor.referencePoint

  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)

  const laneViolation = getLaneViolation(
    points,
    startPoint,
    competitor.referencePoint,
    exitWindowPoint
  )


  useEffect(() => {
    const { latitude, longitude } = initialStartPoint

    if (!latitude || !longitude) return

    setStartPoint({ latitude, longitude })
  }, [initialStartPoint])

  useEffect(() => {
    const { latitude, longitude } = initialEndPoint

    if (!latitude || !longitude) return

    setEndPoint({ latitude, longitude })
  }, [initialEndPoint])

  const handleStartPointDrag = useCallback(coordinates => setStartPoint(coordinates), [])
  const handleEndPointDrag = useCallback(coordinates => setEndPoint(coordinates), [])

  return (
    <>
      <Overlay startPoint={startPoint} endPoint={endPoint} />
      <Marker {...startPoint} onDrag={handleStartPointDrag} />
      <Marker {...endPoint} onDrag={handleEndPointDrag} />

      {laneViolation && <MostDistantPoint laneViolation={laneViolation} />}
    </>
  )
}

export default DesignatedLane
