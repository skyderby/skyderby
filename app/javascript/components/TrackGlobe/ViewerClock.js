import { useEffect } from 'react'

const ViewerClock = ({ Cesium, viewer, points }) => {
  const startTime = Cesium.JulianDate.fromDate(new Date(points[0].gpsTime))
  const stopTime = Cesium.JulianDate.fromDate(new Date(points[points.length - 1].gpsTime))

  useEffect(() => {
    if (!viewer) return

    viewer.clock.startTime = startTime.clone()
    viewer.clock.stopTime = stopTime.clone()
    viewer.clock.currentTime = startTime.clone()
    viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
    viewer.clock.shouldAnimate = false

    viewer.timeline.zoomTo(startTime, stopTime)
  }, [Cesium, viewer, startTime, stopTime])

  return null
}

export default ViewerClock
