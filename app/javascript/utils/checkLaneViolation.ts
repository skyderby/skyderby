import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'
import { PointRecord } from 'api/tracks/points'

const maxAllowedDeviationUntilExitWindow = 300
const maxAllowedDeviationAfterExitWindow = 600

interface Coordinate {
  latitude: number
  longitude: number
}

const mostDistantPoint = (
  points: PointRecord[],
  laneEnterPoint: Coordinate,
  referencePoint: Coordinate,
  startPoint: PointRecord,
  endPoint: PointRecord
) => {
  const laneEnter = new LatLon(laneEnterPoint.latitude, laneEnterPoint.longitude)
  const refPointCoordinate = new LatLon(referencePoint.latitude, referencePoint.longitude)
  const distanceFromLaneEnterToReferencePoint = laneEnter.distanceTo(refPointCoordinate)

  const pointsWithDistances = points.map(point => {
    if (point.gpsTime < startPoint.gpsTime || point.gpsTime > endPoint.gpsTime) {
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

const getLaneViolation = (
  points: PointRecord[],
  laneEnterPoint: PointRecord,
  referencePoint: Coordinate,
  exitWindowPoint: PointRecord
) => {
  if (points.length === 0 || !laneEnterPoint || !exitWindowPoint || !referencePoint)
    return undefined

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
