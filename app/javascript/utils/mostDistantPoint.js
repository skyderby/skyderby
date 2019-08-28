import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

export default function(path, afterExitPoint, referencePoint, endPoint) {
  if (!afterExitPoint || !referencePoint) return

  const laneEnter = new LatLon(afterExitPoint.lat, afterExitPoint.lng)
  const refPointCoordinate = new LatLon(referencePoint.lat, referencePoint.lng)
  const distanceFromExitToReferencePoint = laneEnter.distanceTo(refPointCoordinate)

  const laneEnterTime = Date.parse(afterExitPoint.gpsTime)
  const leaveWindowTime = Date.parse(endPoint.gpsTime)

  const pointsWithDistances = path.map(point => {
    const gpsTime = Date.parse(point.gpsTime)
    if (gpsTime < laneEnterTime || gpsTime > leaveWindowTime) {
      return { ...point, distance: 0 }
    }

    const coordinates = new LatLon(point.lat, point.lng)

    const distanceFromEnterLane = coordinates.distanceTo(laneEnter)
    const distanceToReferencePoint = coordinates.distanceTo(refPointCoordinate)

    const halfPerimeter =
      (distanceFromExitToReferencePoint +
        distanceFromEnterLane +
        distanceToReferencePoint) /
      2

    const distance =
      (2 *
        Math.sqrt(
          halfPerimeter *
            (halfPerimeter - distanceFromExitToReferencePoint) *
            (halfPerimeter - distanceFromEnterLane) *
            (halfPerimeter - distanceToReferencePoint)
        )) /
      distanceFromExitToReferencePoint

    return { ...point, distance }
  })

  return pointsWithDistances.reduce(
    (max, current) => (current.distance > max.distance ? current : max),
    pointsWithDistances[0]
  )
}
