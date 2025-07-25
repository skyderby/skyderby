import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

const proximityThreshold = 150

export function calculateDistance(point1, point2) {
  const coord1 = new LatLon(point1.latitude, point1.longitude)
  const coord2 = new LatLon(point2.latitude, point2.longitude)
  return coord1.distanceTo(coord2)
}

export function checkProximityViolation(
  currentJump,
  otherJumps,
  validationWindowStart,
  mapInstance
) {
  try {
    const { points, exitedAt, deployFlTime } = currentJump

    if (!exitedAt || !deployFlTime || !points) {
      return { hasViolation: false, markers: [] }
    }

    const validationStart = new Date(exitedAt).getTime() + validationWindowStart
    const currentFreeFallPoints = points.filter(
      point => point.gpsTime.getTime() >= validationStart && point.flTime <= deployFlTime
    )

    if (currentFreeFallPoints.length === 0) {
      return { hasViolation: false, markers: [] }
    }

    let hasViolation = false
    let violationData = null

    for (const otherJump of otherJumps) {
      if (!otherJump.points || otherJump.points.length === 0) continue

      const otherExitTime = otherJump.exitedAt
        ? new Date(otherJump.exitedAt).getTime() + validationWindowStart
        : 0

      const pointsByTime = new Map(
        otherJump.points
          .filter(point => point.gpsTime.getTime() >= otherExitTime)
          .map(point => [point.gpsTime.getTime(), point])
      )

      for (const currentPoint of currentFreeFallPoints) {
        const otherPoint = pointsByTime.get(currentPoint.gpsTime.getTime())
        if (!otherPoint) continue

        const altitudeDiff = Math.abs(currentPoint.altitude - otherPoint.altitude)
        if (altitudeDiff >= proximityThreshold) continue

        const horizontalDistance = calculateDistance(currentPoint, otherPoint)
        if (horizontalDistance >= proximityThreshold) continue

        const distance3D = Math.sqrt(
          horizontalDistance * horizontalDistance + altitudeDiff * altitudeDiff
        )

        if (distance3D < proximityThreshold) {
          hasViolation = true
          violationData = {
            point1: currentPoint,
            point2: otherPoint,
            distance: distance3D
          }
          break
        }
      }

      if (hasViolation) break
    }

    if (hasViolation && violationData) {
      const markers = createProximityMarkers(
        violationData.point1,
        violationData.point2,
        violationData.distance,
        mapInstance
      )
      return { hasViolation: true, markers }
    }

    return { hasViolation: false, markers: [] }
  } catch (error) {
    console.error('Error checking proximity violation:', error)
    return { hasViolation: false, markers: [] }
  }
}

export function createProximityMarkers(point1, point2, distance, map) {
  const markers = []
  const violationText = `Proximity: ${Math.round(distance * 10) / 10}m`

  const marker1 = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: { lat: point1.latitude, lng: point1.longitude },
    content: createProximityMarkerContent(violationText)
  })

  const marker2 = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: { lat: point2.latitude, lng: point2.longitude },
    content: createProximityMarkerContent('')
  })

  const line = new google.maps.Polyline({
    path: [
      { lat: point1.latitude, lng: point1.longitude },
      { lat: point2.latitude, lng: point2.longitude }
    ],
    geodesic: true,
    strokeColor: '#ff0000',
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map: map
  })

  markers.push(marker1, marker2, line)
  return markers
}

function createProximityMarkerContent(text) {
  const color = '#ff0000'
  const crossSize = 4

  const lineLength = 48
  const lineAngle = 135
  const lineRad = (lineAngle * Math.PI) / 180

  const endX = 60 + Math.cos(lineRad) * lineLength
  const endY = 80 + Math.sin(lineRad) * lineLength

  const textX = endX + Math.cos(lineRad) * 5
  const textY = endY + Math.sin(lineRad) * 5

  const padding = 6
  const textWidth = text ? text.length * 6 + padding * 2 : 0
  const textHeight = 16 + padding * 2
  const rectX = textX - textWidth / 2
  const rectY = textY - textHeight / 2

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80" fill="none" style="overflow: visible;">
      <defs>
        <filter id="proximityShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="black" flood-opacity="0.75"/>
        </filter>
      </defs>
      ${text ? `<line x1="60" y1="80" x2="${endX}" y2="${endY}" stroke="black" stroke-width="1" filter="url(#proximityShadow)"/>` : ''}
      <g transform="translate(60, 82)">
        <line x1="-${crossSize}" y1="-${crossSize}" x2="${crossSize}" y2="${crossSize}" stroke="${color}" stroke-width="2"/>
        <line x1="${crossSize}" y1="-${crossSize}" x2="-${crossSize}" y2="${crossSize}" stroke="${color}" stroke-width="2"/>
      </g>
      ${
        text
          ? `<rect x="${rectX}" y="${rectY}" width="${textWidth}" height="${textHeight}" fill="black" rx="4" ry="4"/>
             <text x="${textX}" y="${textY + 4}" fill="${color}" font-family="Arial" font-size="12" font-weight="normal" text-anchor="middle">${text}</text>`
          : ''
      }
    </svg>
  `

  const parser = new DOMParser()
  const svgElement = parser.parseFromString(svgString, 'image/svg+xml').documentElement

  return svgElement
}
