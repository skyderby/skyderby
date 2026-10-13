import { vincentyDistance } from './geo'

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

  const distanceFromLaneEnterToReferencePoint = vincentyDistance(
    laneEnterPoint,
    referencePoint
  )

  const startTime = startPoint.gpsTime
  const endTime = endPoint.gpsTime

  const pointsWithDistances = points.map(point => {
    const gpsTime = point.gpsTime
    if (gpsTime < startTime || gpsTime > endTime) {
      return { ...point, distance: 0 }
    }

    const distanceFromEnterLane = vincentyDistance(point, laneEnterPoint)
    const distanceToReferencePoint = vincentyDistance(point, referencePoint)

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
  points,
  laneEnterPoint,
  referencePoint,
  exitWindowPoint,
  deployPoint,
  laneValidationStopsAt
) => {
  const mostDistantPointUntilWindowExit = mostDistantPoint(
    points,
    laneEnterPoint,
    referencePoint,
    laneEnterPoint,
    exitWindowPoint
  )

  const mostDistantPointAfterWindowExit =
    laneValidationStopsAt === 'deploy'
      ? mostDistantPoint(
          points,
          laneEnterPoint,
          referencePoint,
          exitWindowPoint,
          deployPoint || points.at(-1)
        )
      : null

  if (
    mostDistantPointAfterWindowExit &&
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
