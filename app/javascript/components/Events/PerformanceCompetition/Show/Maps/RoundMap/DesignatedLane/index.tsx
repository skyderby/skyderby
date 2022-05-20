import React, { useState, useEffect, useCallback } from 'react'

import {
  Competitor,
  PerformanceCompetition,
  ReferencePoint,
  Result
} from 'api/performanceCompetitions'
import useResultPoints from 'components/Events/PerformanceCompetition/useResultPoints'
import Overlay from './Overlay'
import Marker from './Marker'
import MostDistantPoint from './MostDistantPoint'
import getLaneViolation from 'utils/checkLaneViolation'

interface Coordinate {
  latitude: number
  longitude: number
}

type DesignatedLaneProps = {
  event: PerformanceCompetition
  competitor: Competitor & { result: Result; referencePoint: ReferencePoint | null }
}

const DesignatedLane = ({ event, competitor }: DesignatedLaneProps) => {
  const {
    points,
    afterExitPoint,
    startPoint: enterWindowPoint,
    endPoint: exitWindowPoint,
    isLoading
  } = useResultPoints(event, competitor.result)

  const initialStartPoint =
    event.designatedLaneStart === 'on10Sec' ? afterExitPoint : enterWindowPoint
  const initialEndPoint = competitor.referencePoint

  const [startPoint, setStartPoint] = useState<Coordinate | null>(null)
  const [endPoint, setEndPoint] = useState<Coordinate | null>(null)

  useEffect(() => {
    const { latitude, longitude } = initialStartPoint ?? {}

    if (!latitude || !longitude) return

    setStartPoint({ latitude, longitude })
  }, [initialStartPoint])

  useEffect(() => {
    if (!initialEndPoint) return

    const { latitude, longitude } = initialEndPoint
    setEndPoint({ latitude, longitude })
  }, [initialEndPoint])

  const handleStartPointDrag = useCallback(
    (coordinates: Coordinate) => setStartPoint(coordinates),
    []
  )
  const handleEndPointDrag = useCallback(
    (coordinates: Coordinate) => setEndPoint(coordinates),
    []
  )

  if (isLoading) return null

  const laneViolation =
    initialStartPoint &&
    endPoint &&
    exitWindowPoint &&
    getLaneViolation(points, initialStartPoint, endPoint, exitWindowPoint)

  return (
    <>
      {startPoint && endPoint && <Overlay startPoint={startPoint} endPoint={endPoint} />}
      {startPoint && (
        <Marker
          latitude={startPoint.latitude}
          longitude={startPoint.longitude}
          onDrag={handleStartPointDrag}
        />
      )}
      {endPoint && (
        <Marker
          latitude={endPoint.latitude}
          longitude={endPoint.longitude}
          onDrag={handleEndPointDrag}
        />
      )}

      {laneViolation && <MostDistantPoint laneViolation={laneViolation} />}
    </>
  )
}

export default DesignatedLane
