import LatLon from 'geodesy/latlon-nvector-spherical'

interface Point {
  latitude: number
  longitude: number
}

type MaybePoint = Partial<Point>

const nullCoordinate = { latitude: 0, longitude: 0 }

const nullParams = {
  bearing: 0,
  top: nullCoordinate,
  bottom: nullCoordinate,
  right: nullCoordinate,
  left: nullCoordinate
}

const isValidPoint = (point: MaybePoint): point is Point =>
  Boolean(point.latitude && point.longitude)

const getLaneParams = (startPoint: MaybePoint, endPoint: MaybePoint) => {
  const width = 1200

  if (!isValidPoint(startPoint) || !isValidPoint(endPoint)) return nullParams

  const startCoordinate = new LatLon(startPoint.latitude, startPoint.longitude)
  const endCoordinate = new LatLon(endPoint.latitude, endPoint.longitude)

  const length = startCoordinate.distanceTo(endCoordinate) * 1.3
  const center = startCoordinate.midpointTo(endCoordinate)

  return {
    top: center.destinationPoint(length / 2, 0),
    bottom: center.destinationPoint(length / 2, 180),
    right: center.destinationPoint(width / 2, 90),
    left: center.destinationPoint(width / 2, 270),
    bearing: startCoordinate.initialBearingTo(endCoordinate)
  }
}

export default getLaneParams
