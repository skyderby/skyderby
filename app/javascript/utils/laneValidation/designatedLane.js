import LatLon from 'geodesy/latlon-nvector-spherical'
import getLaneViolation from 'utils/checkLaneViolation'
import { calculateBearing } from 'utils/laneValidation/trackGraphics'

const MARKER_ICON = {
  path: 'M 0, 0 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0',
  fillOpacity: 0.5,
  strokeWeight: 0,
  fillColor: '#345995',
  scale: 0.15
}

export function createDesignatedLane(
  map,
  startPoint,
  windowEndPoint,
  referencePoint,
  points
) {
  if (!map || !startPoint || !windowEndPoint || !referencePoint) return null

  const overlay = createOverlay(map, startPoint, referencePoint)
  const markers = createMarkers(map, startPoint, referencePoint)

  let violationMarker = null
  if (points && points.length > 0) {
    const laneViolation = getLaneViolation(
      points,
      startPoint,
      referencePoint,
      windowEndPoint
    )
    if (laneViolation) {
      violationMarker = createLaneViolationMarker(
        map,
        laneViolation,
        startPoint,
        referencePoint
      )
    }
  }

  return {
    overlay,
    markers,
    violationMarker,
    cleanup() {
      if (overlay) overlay.setMap(null)
      markers.forEach(marker => marker.setMap(null))
      if (violationMarker) violationMarker.setMap(null)
    }
  }
}

function createOverlay(map, startPoint, endPoint) {
  const overlay = new google.maps.OverlayView()

  const div = document.createElement('div')
  div.style.opacity = '0'
  div.style.borderStyle = 'none'
  div.style.borderWidth = '0px'
  div.style.position = 'absolute'

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.style.width = '100%'
  svg.style.height = '100%'
  svg.style.opacity = '0.5'
  svg.style.position = 'absolute'

  svg.innerHTML = `
    <defs>
      <pattern id="dashedLine" patternUnits="userSpaceOnUse" width="10" height="100%">
        <line x1="5" y1="0" x2="5" y2="5" stroke="#333" stroke-width="2"/>
      </pattern>
    </defs>
    <rect x="0%" y="8%" width="12.5%" height="84%" fill="#ff6b6b"/>
    <rect x="12.5%" y="8%" width="12.5%" height="84%" fill="#ffd93d"/>
    <rect x="25%" y="8%" width="50%" height="84%" fill="#00bcd4"/>
    <rect x="75%" y="8%" width="12.5%" height="84%" fill="#ffd93d"/>
    <rect x="87.5%" y="8%" width="12.5%" height="84%" fill="#ff6b6b"/>
    <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#333" stroke-width="2" stroke-dasharray="10,5"/>
  `

  div.appendChild(svg)

  overlay.onAdd = function () {
    this.getPanes().overlayLayer.appendChild(div)
  }

  overlay.draw = function () {
    const { top, right, bottom, left, bearing } = getLaneParams(startPoint, endPoint)

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(bottom.latitude, left.longitude),
      new google.maps.LatLng(top.latitude, right.longitude)
    )

    const projection = this.getProjection()
    const southWest = projection.fromLatLngToDivPixel(bounds.getSouthWest())
    const northEast = projection.fromLatLngToDivPixel(bounds.getNorthEast())

    div.style.opacity = '1'
    div.style.left = `${southWest.x}px`
    div.style.top = `${northEast.y}px`
    div.style.height = `${southWest.y - northEast.y}px`
    div.style.width = `${northEast.x - southWest.x}px`
    div.style.transform = `rotate(${bearing}deg)`
  }

  overlay.onRemove = function () {
    if (div.parentNode) {
      div.parentNode.removeChild(div)
    }
  }

  overlay.setMap(map)
  return overlay
}

function createMarkers(map, startPoint, endPoint) {
  const startMarker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(startPoint.latitude, startPoint.longitude),
    icon: MARKER_ICON,
    draggable: false
  })

  const endMarker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(endPoint.latitude, endPoint.longitude),
    icon: MARKER_ICON,
    draggable: false
  })

  return [startMarker, endMarker]
}

function createLaneViolationMarker(map, laneViolation, startPoint, endPoint) {
  const deviation = laneViolation.distance - 300
  const violationText = `Violation: ${Math.round(deviation * 10) / 10}m`

  const bearing = calculateBearing(startPoint, endPoint)
  const point = {
    latitude: Number(laneViolation.latitude),
    longitude: Number(laneViolation.longitude)
  }

  const violationMarker = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: { lat: point.latitude, lng: point.longitude },
    content: createViolationMarkerContent(violationText, bearing)
  })

  return violationMarker
}

function createViolationMarkerContent(text, bearing) {
  const color = '#ff0000'

  const perpBearing = (bearing + 30) % 360
  const perpRad = (perpBearing * Math.PI) / 180

  const crossSize = 4
  const centerX = 60
  const centerY = 80 + crossSize / 2

  const lineLength = 48

  const endX = centerX + Math.cos(perpRad) * lineLength
  const endY = centerY + Math.sin(perpRad) * lineLength

  const textX = endX + Math.cos(perpRad) * 5
  const textY = endY + Math.sin(perpRad) * 5

  const padding = 6
  const textWidth = text.length * 6 + padding * 2
  const textHeight = 16 + padding * 2
  const rectX = textX - textWidth / 2
  const rectY = textY - textHeight / 2

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80" fill="none" style="overflow: visible;">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="black" flood-opacity="0.75"/>
        </filter>
      </defs>
      <line x1="${centerX}" y1="${centerY}" x2="${endX}" y2="${endY}" stroke="black" stroke-width="1" filter="url(#shadow)"/>
      <g transform="translate(${centerX}, ${centerY})">
        <line x1="-${crossSize}" y1="-${crossSize}" x2="${crossSize}" y2="${crossSize}" stroke="${color}" stroke-width="2"/>
        <line x1="${crossSize}" y1="-${crossSize}" x2="-${crossSize}" y2="${crossSize}" stroke="${color}" stroke-width="2"/>
      </g>
      <rect x="${rectX}" y="${rectY}" width="${textWidth}" height="${textHeight}" fill="black" rx="4" ry="4"/>
      <text x="${textX}" y="${textY + 4}" fill="${color}" font-family="Arial" font-size="12" font-weight="normal" text-anchor="middle">${text}</text>
    </svg>
  `

  const parser = new DOMParser()
  const svgElement = parser.parseFromString(svgString, 'image/svg+xml').documentElement

  return svgElement
}

function getLaneParams(startPoint, endPoint) {
  const width = 1200

  if (
    !startPoint.latitude ||
    !startPoint.longitude ||
    !endPoint.latitude ||
    !endPoint.longitude
  ) {
    const nullCoordinate = { latitude: 0, longitude: 0 }
    return {
      bearing: 0,
      top: nullCoordinate,
      bottom: nullCoordinate,
      right: nullCoordinate,
      left: nullCoordinate
    }
  }

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
