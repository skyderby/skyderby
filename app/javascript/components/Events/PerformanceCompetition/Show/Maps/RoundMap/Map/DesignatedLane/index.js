import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

import Overlay from './Overlay'
import Marker from './Marker'
import MostDistantPoint from './MostDistantPoint'

const DesignatedLane = ({ map }) => {
  const {
    enabled,
    startPoint: initialStartPoint = {},
    endPoint: initialEndPoint = {},
    laneViolation
  } = useSelector(state => state.eventRound.designatedLane)

  const [startPoint, setStartPoint] = useState({
    latitude: initialStartPoint.latitude,
    longitude: initialStartPoint.longitude
  })

  const [endPoint, setEndPoint] = useState({
    latitude: initialEndPoint.latitude,
    longitude: initialEndPoint.longitude
  })

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

  if (!enabled) return null

  return (
    <>
      <Overlay map={map} startPoint={startPoint} endPoint={endPoint} />
      <Marker map={map} {...startPoint} onDrag={handleStartPointDrag} />
      <Marker map={map} {...endPoint} onDrag={handleEndPointDrag} />

      {laneViolation && <MostDistantPoint map={map} laneViolation={laneViolation} />}
    </>
  )
}

export default DesignatedLane
