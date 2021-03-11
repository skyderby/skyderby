import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

const maxAllowedDeviationUntilExitWindow = 300
const maxAllowedDeviationAfterExitWindow = 600

const mostDistantPoint = (
  points,
  laneEnterPoint,
  referencePoint,
  startPoint,
  endPoint
) => {
  if (!startPoint || !referencePoint) return

  const laneEnter = new LatLon(laneEnterPoint.latitude, laneEnterPoint.longitude)
  const refPointCoordinate = new LatLon(referencePoint.latitude, referencePoint.longitude)
  const distanceFromLaneEnterToReferencePoint = laneEnter.distanceTo(refPointCoordinate)

  const startTime = Date.parse(startPoint.gpsTime)
  const endTime = Date.parse(endPoint.gpsTime)

  const pointsWithDistances = points.map(point => {
    const gpsTime = Date.parse(point.gpsTime)
    if (gpsTime < startTime || gpsTime > endTime) {
      return { ...point, distance: 0 }
    }

    const coordinates = new LatLon(point.latitude, point.longitude)

    const distanceFromEnterLane = coordinates.distanceTo(laneEnter)
    const distanceToReferencePoint = coordinates.distanceTo(refPointCoordinate)

    const halfPerimeter =
      (distanceFromLaneEnterToReferencePoint +
        distanceFromEnterLane +
        distanceToReferencePoint) /
      2

    const distance =
      (2 *
        Math.sqrt(
          halfPerimeter *
            (halfPerimeter - distanceFromLaneEnterToReferencePoint) *
            (halfPerimeter - distanceFromEnterLane) *
            (halfPerimeter - distanceToReferencePoint)
        )) /
      distanceFromLaneEnterToReferencePoint

    return { ...point, distance }
  })

  return pointsWithDistances.reduce(
    (max, current) => (current.distance > max.distance ? current : max),
    pointsWithDistances[0]
  )
}

const getLaneViolation = (points, laneEnterPoint, referencePoint, exitWindowPoint) => {
  const mostDistantPointUntilWindowExit = mostDistantPoint(
    points,
    laneEnterPoint,
    referencePoint,
    laneEnterPoint,
    exitWindowPoint
  )

  const mostDistantPointAfterWindowExit = mostDistantPoint(
    points,
    laneEnterPoint,
    referencePoint,
    exitWindowPoint,
    points[points.length - 1]
  )

  if (
    mostDistantPointAfterWindowExit.distance > maxAllowedDeviationAfterExitWindow &&
    mostDistantPointAfterWindowExit.distance > mostDistantPointUntilWindowExit.distance
  ) {
    return mostDistantPointAfterWindowExit
  } else if (
    mostDistantPointUntilWindowExit.distance > maxAllowedDeviationUntilExitWindow
  ) {
    return mostDistantPointUntilWindowExit
  } else {
    return undefined
  }
}

export default getLaneViolation
