import Geospatial from '../geospatial'
import { findDeployPoint } from './utils'
import { proximityThreshold, distance3D } from './proximityCheck'
import { LOCATION_ARROW_PATH } from '../tracks/locationArrowPath'

export const LINE_DISTANCE = 300

const HEADING_LOOKAHEAD = 1000

const pointTime = point => new Date(point.gpsTime).getTime()

export function prepareJumps(jumps) {
  return jumps
    .filter(jump => jump.points && jump.points.length > 0)
    .map(jump => {
      const times = jump.points.map(pointTime)
      const deployPoint = findDeployPoint(jump.points, jump.deployFlTime)

      return {
        ...jump,
        times,
        exitTime: jump.exitedAt ? new Date(jump.exitedAt).getTime() : times[0],
        deployTime: deployPoint ? pointTime(deployPoint) : times[times.length - 1]
      }
    })
}

export function timelineRange(jumps) {
  if (jumps.length === 0) return null

  return {
    start: Math.min(...jumps.map(jump => jump.exitTime)),
    end: Math.max(...jumps.map(jump => jump.deployTime))
  }
}

function segmentIndex(times, time) {
  if (time < times[0] || time > times[times.length - 1]) return -1

  let low = 0
  let high = times.length - 1

  while (high - low > 1) {
    const middle = (low + high) >> 1
    if (times[middle] <= time) {
      low = middle
    } else {
      high = middle
    }
  }

  return low
}

export function pointAt(jump, time) {
  const { points, times } = jump
  const index = segmentIndex(times, time)
  if (index < 0) return null

  const current = points[index]
  const next = points[Math.min(index + 1, points.length - 1)]
  const span = times[index + 1] - times[index]
  const ratio = span > 0 ? (time - times[index]) / span : 0

  return {
    latitude: current.latitude + (next.latitude - current.latitude) * ratio,
    longitude: current.longitude + (next.longitude - current.longitude) * ratio,
    altitude: current.altitude + (next.altitude - current.altitude) * ratio
  }
}

export function headingAt(jump, time, current) {
  const ahead = pointAt(jump, time + HEADING_LOOKAHEAD)
  if (ahead) {
    return Geospatial.bearing(
      current.latitude,
      current.longitude,
      ahead.latitude,
      ahead.longitude
    )
  }

  const behind = pointAt(jump, time - HEADING_LOOKAHEAD)
  if (!behind) return 0

  return Geospatial.bearing(
    behind.latitude,
    behind.longitude,
    current.latitude,
    current.longitude
  )
}

export function positionsAt(jumps, time) {
  return jumps.flatMap(jump => {
    if (time < jump.exitTime) return []

    const point = pointAt(jump, time)
    if (!point) return []

    return [
      {
        jump,
        point,
        heading: headingAt(jump, time, point),
        freefall: time <= jump.deployTime
      }
    ]
  })
}

export function pairDistances(positions, maxDistance = LINE_DISTANCE) {
  const pairs = []

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (!positions[i].freefall && !positions[j].freefall) continue

      const distance = distance3D(positions[i].point, positions[j].point)
      if (distance < maxDistance) {
        pairs.push({ first: positions[i], second: positions[j], distance })
      }
    }
  }

  return pairs
}

export function formatElapsed(milliseconds) {
  const tenths = Math.round(Math.max(0, milliseconds) / 100)
  const minutes = Math.floor(tenths / 600)
  const seconds = ((tenths - minutes * 600) / 10).toFixed(1).padStart(4, '0')

  return `${minutes}:${seconds}`
}

export class ReplayOverlay {
  constructor(map, { unit = 'm', closeColor = '#e22732', farColor = '#333333' } = {}) {
    this.map = map
    this.unit = unit
    this.closeColor = closeColor
    this.farColor = farColor
    this.markers = new Map()
    this.lines = new Map()
  }

  render(jumps, time) {
    const positions = positionsAt(jumps, time)
    const visibleIds = new Set(positions.map(({ jump }) => jump.id))

    positions.forEach(({ jump, point, heading }) =>
      this.placeMarker(jump, point, heading)
    )
    this.markers.forEach((marker, id) => {
      if (!visibleIds.has(id)) marker.map = null
    })

    const pairs = pairDistances(positions)
    const visiblePairs = new Set()

    pairs.forEach(pair => {
      const key = `${pair.first.jump.id}-${pair.second.jump.id}`
      visiblePairs.add(key)
      this.placeLine(key, pair)
    })
    this.lines.forEach((line, key) => {
      if (!visiblePairs.has(key)) this.hideLine(line)
    })
  }

  clear() {
    this.markers.forEach(marker => (marker.map = null))
    this.markers.clear()
    this.lines.forEach(line => this.hideLine(line))
    this.lines.clear()
  }

  placeMarker(jump, point, heading) {
    let marker = this.markers.get(jump.id)

    if (!marker) {
      marker = new google.maps.marker.AdvancedMarkerElement({
        content: buildArrowElement(jump.color),
        title: jump.name,
        zIndex: 10
      })
      this.markers.set(jump.id, marker)
    }

    marker.position = { lat: point.latitude, lng: point.longitude }
    if (!marker.map) marker.map = this.map

    marker.content.style.transform = `translateY(50%) rotate(${heading - 45}deg)`
  }

  placeLine(key, { first, second, distance }) {
    let line = this.lines.get(key)

    if (!line) {
      const labelElement = document.createElement('div')
      line = {
        polyline: new google.maps.Polyline({ geodesic: true, strokeWeight: 2 }),
        label: new google.maps.marker.AdvancedMarkerElement({
          content: labelElement,
          zIndex: 20
        }),
        labelElement,
        close: null
      }
      this.lines.set(key, line)
    }

    const close = distance < proximityThreshold
    const path = [
      { lat: first.point.latitude, lng: first.point.longitude },
      { lat: second.point.latitude, lng: second.point.longitude }
    ]

    line.polyline.setPath(path)
    if (line.close !== close) {
      line.polyline.setOptions({
        strokeColor: close ? this.closeColor : this.farColor,
        strokeOpacity: close ? 1 : 0.7
      })
      line.labelElement.className = close
        ? 'lane-validation-replay-distance lane-validation-replay-distance--close'
        : 'lane-validation-replay-distance'
      line.close = close
    }
    if (!line.polyline.getMap()) line.polyline.setMap(this.map)

    line.labelElement.textContent = `${Math.round(distance)} ${this.unit}`
    line.label.position = {
      lat: (path[0].lat + path[1].lat) / 2,
      lng: (path[0].lng + path[1].lng) / 2
    }
    if (!line.label.map) line.label.map = this.map
  }

  hideLine(line) {
    line.polyline.setMap(null)
    line.label.map = null
  }
}

function buildArrowElement(color) {
  const wrapper = document.createElement('div')
  wrapper.className = 'lane-validation-replay-arrow'
  wrapper.innerHTML =
    '<svg viewBox="0 0 640 640" width="24" height="24">' +
    `<path fill="${color}" stroke="#ffffff" stroke-width="24" d="${LOCATION_ARROW_PATH}"/></svg>`
  return wrapper
}
