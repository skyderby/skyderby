import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

export const selectDesignatedLaneParams = state => {
  const { startPoint, endPoint } = state.eventRoundMap.designatedLane

  if (!startPoint || !endPoint) return

  const startCoordinate = new LatLon(startPoint.latitude, startPoint.longitude)
  const endCoordinate = new LatLon(endPoint.latitude, endPoint.longitude)

  return {
    distance: startCoordinate.distanceTo(endCoordinate),
    bearing: startCoordinate.initialBearingTo(endCoordinate)
  }
}
