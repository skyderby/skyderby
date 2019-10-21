import React, { useContext, useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

import MapContext from 'components/RoundMap/Map/MapContext'
import Overlay from './Overlay'
import Marker from './Marker'

const DesignatedLane = () => {
  const { map } = useContext(MapContext)
  const {
    enabled,
    startPoint: initialStartPoint = {},
    endPoint: initialEndPoint = {}
  } = useSelector(state => state.eventRoundMap.designatedLane)

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
    </>
  )
}

export default DesignatedLane
