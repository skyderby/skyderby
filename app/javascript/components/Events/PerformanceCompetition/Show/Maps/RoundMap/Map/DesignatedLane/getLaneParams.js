import LatLon from 'geodesy/latlon-nvector-spherical'

const nullCoordinate = { latitude: 0, longitude: 0 }

const nullParams = {
  bearing: 0,
  top: nullCoordinate,
  bottom: nullCoordinate,
  right: nullCoordinate,
  left: nullCoordinate
}

const isBlankPoint = point => !point.latitude || !point.longitude

export default (startPoint, endPoint) => {
  const width = 1200

  if (isBlankPoint(startPoint) || isBlankPoint(endPoint)) return nullParams

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
