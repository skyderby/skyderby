import LatLon from 'geodesy/latlon-nvector-spherical'

const afterExitColor = 'rgb(18, 78, 120)'
const windowStartColor = 'rgb(252, 35, 94)'
const windowEndColor = 'rgb(96, 173, 66)'

export function createTrackGraphics(trackId, data, color, map, exitedAt) {
  const polylines = []
  const points = data.points || []
  const deployFlTime = data.deployFlTime

  if (points.length === 0) return { polylines, windowMarkers: [] }

  if (exitedAt) {
    const exitedAtTime = new Date(exitedAt).getTime()
    const beforeExitPoints = points.filter(point => {
      const pointTime = new Date(point.gpsTime).getTime()
      return pointTime < exitedAtTime
    })

    if (beforeExitPoints.length > 0) {
      const beforeExitPath = beforeExitPoints.map(point => ({
        lat: point.latitude,
        lng: point.longitude
      }))

      const beforeExitPolyline = new google.maps.Polyline({
        path: beforeExitPath,
        strokeColor: color,
        strokeWeight: 1,
        strokeOpacity: 1.0
      })

      beforeExitPolyline.setMap(map)
      polylines.push(beforeExitPolyline)
    }
  }

  const mainPoints = points.filter(point => {
    if (exitedAt) {
      const exitedAtTime = new Date(exitedAt).getTime()
      const pointTime = new Date(point.gpsTime).getTime()
      if (pointTime < exitedAtTime) return false
    }

    if (deployFlTime) {
      return point.flTime <= deployFlTime
    }

    return true
  })

  if (mainPoints.length > 0) {
    const mainPath = mainPoints.map(point => ({
      lat: point.latitude,
      lng: point.longitude
    }))

    const mainPolyline = new google.maps.Polyline({
      path: mainPath,
      strokeColor: color,
      strokeWeight: 3,
      strokeOpacity: 1.0
    })

    mainPolyline.setMap(map)
    polylines.push(mainPolyline)
  }

  if (deployFlTime) {
    const afterDeployPoints = points.filter(point => point.flTime > deployFlTime)

    if (afterDeployPoints.length > 0) {
      const afterDeployPath = afterDeployPoints.map(point => ({
        lat: point.latitude,
        lng: point.longitude
      }))

      const afterDeployPolyline = new google.maps.Polyline({
        path: afterDeployPath,
        strokeColor: color,
        strokeWeight: 1,
        strokeOpacity: 1
      })

      afterDeployPolyline.setMap(map)
      polylines.push(afterDeployPolyline)
    }
  }

  return { polylines, windowMarkers: [] }
}

export function createWindowMarkers(
  trackId,
  points,
  windowStartValue,
  windowEndValue,
  dlStartValue,
  map,
  exitedAt
) {
  if (!map || !windowStartValue || !windowEndValue) return []

  const windowStartPoint = interpolatePointByAltitude(points, windowStartValue)
  const windowEndPoint = interpolatePointByAltitude(points, windowEndValue)

  if (!windowStartPoint || !windowEndPoint) return []

  const bearing = calculateBearing(windowStartPoint, windowEndPoint)

  const startMarker = createWindowMarker(
    windowStartPoint,
    `${windowStartValue}m`,
    windowStartColor,
    bearing,
    map
  )

  const endMarker = createWindowMarker(
    windowEndPoint,
    `${windowEndValue}m`,
    windowEndColor,
    bearing,
    map
  )

  const markers = [startMarker, endMarker]

  if (dlStartValue === 'on_9_sec' || dlStartValue === 'on_10_sec') {
    if (exitedAt) {
      const seconds = dlStartValue === 'on_9_sec' ? 9 : 10
      const exitedAtTime = new Date(exitedAt).getTime()
      const dlStartTime = exitedAtTime + seconds * 1000

      const dlStartPoint = interpolatePointByTime(points, dlStartTime)

      if (dlStartPoint) {
        const dlStartMarker = createWindowMarker(
          dlStartPoint,
          `${seconds} sec`,
          afterExitColor,
          bearing,
          map
        )
        markers.push(dlStartMarker)
      }
    }
  }

  return markers
}

export function createWindowMarker(point, text, color, bearing, map) {
  const perpBearing = (bearing + 30) % 360
  const perpRad = (perpBearing * Math.PI) / 180

  const radius = 3
  const centerX = 40
  const centerY = 60 + radius / 2

  const lineLength = 15

  const endX = centerX + Math.cos(perpRad) * lineLength
  const endY = centerY + Math.sin(perpRad) * lineLength

  const textX = endX + Math.cos(perpRad) * 5 - 2
  const textY = endY + Math.sin(perpRad) * 5 + 3

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60" fill="none" style="overflow: visible;">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="black" flood-opacity="0.75"/>
        </filter>
      </defs>
      <line x1="${centerX}" y1="${centerY}" x2="${endX}" y2="${endY}" stroke="white" stroke-width="1" filter="url(#shadow)"/>
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" stroke="white" stroke-width="1"/>
      <text x="${textX}" y="${textY}" fill="white" font-family="Arial" font-size="12" font-weight="normal" filter="url(#shadow)" text-anchor="start">${text}</text>
    </svg>
  `

  const parser = new DOMParser()
  const svgElement = parser.parseFromString(svgString, 'image/svg+xml').documentElement

  const marker = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: { lat: point.latitude, lng: point.longitude },
    content: svgElement
  })

  return marker
}

export function interpolatePointByAltitude(points, targetAltitude) {
  for (let i = 0; i < points.length - 1; i++) {
    const currentPoint = points[i]
    const nextPoint = points[i + 1]

    const isWithinRange =
      (currentPoint.altitude >= targetAltitude && nextPoint.altitude <= targetAltitude) ||
      (currentPoint.altitude <= targetAltitude && nextPoint.altitude >= targetAltitude)

    if (isWithinRange) {
      if (currentPoint.altitude === targetAltitude) return currentPoint
      if (nextPoint.altitude === targetAltitude) return nextPoint

      const ratio =
        (targetAltitude - currentPoint.altitude) /
        (nextPoint.altitude - currentPoint.altitude)

      const currentTime = new Date(currentPoint.gpsTime).getTime()
      const nextTime = new Date(nextPoint.gpsTime).getTime()
      const interpolatedTime = currentTime + (nextTime - currentTime) * ratio

      return {
        latitude:
          currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * ratio,
        longitude:
          currentPoint.longitude + (nextPoint.longitude - currentPoint.longitude) * ratio,
        altitude: targetAltitude,
        gpsTime: new Date(interpolatedTime)
      }
    }
  }
}

export function interpolatePointByTime(points, targetTime) {
  for (let i = 0; i < points.length - 1; i++) {
    const currentPoint = points[i]
    const nextPoint = points[i + 1]

    const currentTime = new Date(currentPoint.gpsTime).getTime()
    const nextTime = new Date(nextPoint.gpsTime).getTime()

    const isWithinRange =
      (currentTime <= targetTime && nextTime >= targetTime) ||
      (currentTime >= targetTime && nextTime <= targetTime)

    if (isWithinRange) {
      if (currentTime === targetTime) return currentPoint
      if (nextTime === targetTime) return nextPoint

      const ratio = (targetTime - currentTime) / (nextTime - currentTime)

      return {
        latitude:
          currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * ratio,
        longitude:
          currentPoint.longitude + (nextPoint.longitude - currentPoint.longitude) * ratio,
        altitude:
          currentPoint.altitude + (nextPoint.altitude - currentPoint.altitude) * ratio,
        gpsTime: new Date(targetTime)
      }
    }
  }
}

export function calculateBearing(startPoint, endPoint) {
  const startCoordinate = new LatLon(startPoint.latitude, startPoint.longitude)
  const endCoordinate = new LatLon(endPoint.latitude, endPoint.longitude)

  return startCoordinate.initialBearingTo(endCoordinate)
}
