import {
  interpolatePointByAltitude,
  interpolatePointByTime
} from 'utils/laneValidation/utils'

export function calculateDesignatedLaneStart(
  points,
  exitedAt,
  dlStartValue,
  windowStartValue
) {
  if (!exitedAt || !points || points.length === 0) {
    return interpolatePointByAltitude(points, windowStartValue)
  }

  if (dlStartValue === 'on_10_sec') {
    const exitedAtTime = new Date(exitedAt).getTime()
    const targetTime = exitedAtTime + 10000
    return interpolatePointByTime(points, targetTime)
  }

  if (dlStartValue === 'on_9_sec') {
    const exitedAtTime = new Date(exitedAt).getTime()
    const targetTime = exitedAtTime + 9000
    return interpolatePointByTime(points, targetTime)
  }

  return interpolatePointByAltitude(points, windowStartValue)
}

export async function displayReferencePointMarker(map, referencePoint, mapController) {
  if (!referencePoint || !mapController) return null

  try {
    const marker = await mapController.createMarker(
      referencePoint.latitude,
      referencePoint.longitude,
      referencePoint.name,
      true
    )
    return marker
  } catch (error) {
    console.error('Failed to create reference point marker:', error)
    return null
  }
}

export function fitMapBounds(map, dlStartPoint, referencePoint) {
  if (!map || !dlStartPoint || !referencePoint) return

  const bounds = new google.maps.LatLngBounds()
  bounds.extend(new google.maps.LatLng(dlStartPoint.latitude, dlStartPoint.longitude))
  bounds.extend(new google.maps.LatLng(referencePoint.latitude, referencePoint.longitude))
  map.fitBounds(bounds)
}
