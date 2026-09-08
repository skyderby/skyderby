import { post, patch } from '@rails/request.js'
import { createDesignatedLane } from 'utils/laneValidation/designatedLane'
import { interpolatePointByTime, nearestPointTo, timeOf } from 'utils/tracks/pointHelpers'

const EXIT_VSPEED_KMH = 10 * 3.6
const EXIT_CONSECUTIVE_POINTS = 15
const DEFAULT_START_OFFSET_MS = 9000

const styled = (tag, values) => {
  const element = document.createElement(tag)
  Object.assign(element.style, values)
  return element
}

const buildHitArea = () =>
  styled('div', {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)'
  })

const buildLabel = () =>
  styled('div', {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translate(-50%, -4px)',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(46, 125, 50, 0.95)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    pointerEvents: 'none'
  })

const buildPinMarker = ({ map, position, pin, draggable, children = [] }) => {
  const content = document.createElement('div')
  content.style.position = 'relative'
  if (draggable) content.style.cursor = 'grab'

  children.forEach(child => content.appendChild(child))
  if (draggable) content.appendChild(buildHitArea())
  content.appendChild(new google.maps.marker.PinElement(pin).element)

  return new google.maps.marker.AdvancedMarkerElement({
    map,
    position: new google.maps.LatLng(position.latitude, position.longitude),
    content,
    gmpDraggable: draggable,
    zIndex: 1000
  })
}

export const findExitPoint = points => {
  for (let i = 0; i <= points.length - EXIT_CONSECUTIVE_POINTS; i++) {
    const range = points.slice(i, i + EXIT_CONSECUTIVE_POINTS)
    if (range.every(point => point.vSpeed > EXIT_VSPEED_KMH)) return points[i]
  }

  return points[0]
}

export default class DesignatedLaneEditor {
  constructor({ map, points, referencePointUrl, referencePointData, formatAltitude }) {
    this.map = map
    this.points = points
    this.referencePointUrl = referencePointUrl
    this.referencePointData = referencePointData
    this.formatAltitude = formatAltitude
    this.visible = false
  }

  get exitTime() {
    this._exitTime ??= timeOf(findExitPoint(this.points) ?? this.points[0])
    return this._exitTime
  }

  get referencePoint() {
    const saved = this.referencePointData?.reference_point
    const point = saved ?? this.points.at(-1)
    return { latitude: point.latitude, longitude: point.longitude }
  }

  get editable() {
    return this.referencePointData?.editable ?? false
  }

  show() {
    if (!this.map || !this.points.length) return

    this.clearLane()
    this.visible = true

    const startPoint =
      this.startPoint ??
      interpolatePointByTime(this.points, this.exitTime + DEFAULT_START_OFFSET_MS)
    if (!startPoint) return

    const windowEndPoint = this.points.at(-1)
    this.lane = createDesignatedLane(
      this.map,
      startPoint,
      windowEndPoint,
      windowEndPoint,
      this.referencePoint,
      this.points,
      'window_end'
    )

    this.createReferenceMarker()
    this.createStartMarker(startPoint)
  }

  hide() {
    this.visible = false
    this.clearLane()
    this.referenceMarker?.remove()
    this.startMarker?.remove()
  }

  destroy() {
    this.hide()
  }

  clearLane() {
    this.lane?.cleanup()
    this.lane = null
  }

  nearestTrackPoint({ lat, lng }) {
    return nearestPointTo(this.points, { latitude: lat, longitude: lng })
  }

  createStartMarker(startPoint) {
    this.startMarker?.remove()

    const label = buildLabel()
    label.textContent = this.formatAltitude(startPoint.altitude)

    const marker = buildPinMarker({
      map: this.map,
      position: startPoint,
      draggable: true,
      children: [label],
      pin: {
        background: '#2E7D32',
        borderColor: '#1B5E20',
        glyphColor: '#fff',
        scale: 0.7
      }
    })

    let dragFrame = null
    marker.addListener('drag', () => {
      if (dragFrame) return
      dragFrame = requestAnimationFrame(() => {
        dragFrame = null
        const nearest = this.nearestTrackPoint(marker.position)
        if (nearest) label.textContent = this.formatAltitude(nearest.altitude)
      })
    })

    marker.addListener('dragend', () => {
      if (dragFrame) {
        cancelAnimationFrame(dragFrame)
        dragFrame = null
      }

      const nearest = this.nearestTrackPoint(marker.position)
      if (!nearest) return

      this.startPoint = nearest
      this.show()
    })

    this.startMarker = { marker, remove: () => (marker.map = null) }
  }

  createReferenceMarker() {
    this.referenceMarker?.remove()

    const marker = buildPinMarker({
      map: this.map,
      position: this.referencePoint,
      draggable: this.editable,
      pin: {
        background: '#FF5722',
        borderColor: '#E64A19',
        glyphColor: '#fff',
        scale: 0.7
      }
    })

    marker.addListener('dragend', () => this.saveReferencePoint(marker.position))

    this.referenceMarker = { marker, remove: () => (marker.map = null) }
  }

  saveReferencePoint(position) {
    if (!this.referencePointUrl) return

    const request = this.referencePointData?.reference_point ? patch : post

    request(this.referencePointUrl, {
      body: JSON.stringify({
        reference_point: { latitude: position.lat, longitude: position.lng }
      }),
      responseKind: 'json'
    })
      .then(response => response.json)
      .then(data => {
        this.referencePointData = data
        if (this.visible) this.show()
      })
  }
}
