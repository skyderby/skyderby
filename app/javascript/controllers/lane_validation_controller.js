import { Controller } from '@hotwired/stimulus'
import LatLon from 'geodesy/latlon-nvector-spherical'

const _afterExitColor = 'rgb(18, 78, 120)'
const windowStartColor = 'rgb(252, 35, 94)'
const windowEndColor = 'rgb(96, 173, 66)'

export default class extends Controller {
  static targets = ['referencePoints', 'map']
  static values = {
    eventId: Number,
    windowStart: Number,
    windowEnd: Number
  }

  connect() {
    this.pointsCache = new Map()
    this.trackGraphics = new Map()
    this.referencePointMarkers = new Map()
    this.displayedCompetitors = new Set()
    this.loadReferencePoints()
  }

  loadReferencePoints() {
    try {
      const referencePointsData = this.referencePointsTarget.textContent
      this.referencePoints = JSON.parse(referencePointsData)
    } catch (error) {
      console.error('Failed to load reference points:', error)
      this.referencePoints = []
    }
  }

  disconnect() {
    this.polylines.forEach(polyline => polyline.setMap(null))
    this.polylines.clear()
    this.pointsCache.clear()
  }

  handleCheckboxChange(event) {
    const checkbox = event.target
    const competitorElement = checkbox.closest('.lane-validation-competitor')
    if (!competitorElement) return

    const trackId = competitorElement.dataset.trackId
    const groupId = competitorElement.dataset.groupId
    const color = competitorElement.dataset.color

    if (checkbox.checked) {
      // If it's a group selection, display the whole group
      if (groupId) {
        this.displayGroup(groupId)
      } else {
        // Individual competitor selection
        this.displayedCompetitors.add(trackId)
        this.displayTrack(trackId, color)
      }
    } else {
      this.removeTrack(trackId)
    }
  }

  displayGroup(groupId) {
    this.clearAllTracks()

    const groupElement = this.element
      .querySelector(`[data-group-id="${groupId}"]`)
      .closest('.lane-validation-group')
    if (!groupElement) return

    const competitors = groupElement.querySelectorAll('.lane-validation-competitor')

    competitors.forEach(competitor => {
      const checkbox = competitor.querySelector('input[type="checkbox"]')
      const trackId = competitor.dataset.trackId
      const color = competitor.dataset.color

      checkbox.checked = true
      this.displayedCompetitors.add(trackId)
      this.displayTrack(trackId, color)
    })
  }

  clearAllTracks() {
    this.trackGraphics.forEach(graphics => {
      graphics.polylines.forEach(polyline => polyline.setMap(null))
      graphics.windowMarkers.forEach(marker => marker.setMap(null))
    })
    this.trackGraphics.clear()
    this.displayedCompetitors.clear()

    this.referencePointMarkers.forEach(marker => marker.setMap(null))
    this.referencePointMarkers.clear()

    const allCheckboxes = this.element.querySelectorAll(
      '.lane-validation-competitor input[type="checkbox"]'
    )
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = false
    })
  }

  async displayTrack(trackId, color) {
    if (this.trackGraphics.has(trackId)) return

    try {
      const data = await this.fetchPoints(trackId)
      this.createTrackGraphics(trackId, data, color)
      this.updateReferencePointsOnMap()
    } catch (error) {
      console.error(`Failed to load track ${trackId}:`, error)
    }
  }

  removeTrack(trackId) {
    const graphics = this.trackGraphics.get(trackId)
    if (graphics) {
      graphics.polylines.forEach(polyline => polyline.setMap(null))
      graphics.windowMarkers.forEach(marker => marker.setMap(null))
      this.trackGraphics.delete(trackId)
    }
    this.displayedCompetitors.delete(trackId)

    const competitorElement = this.element.querySelector(`[data-track-id="${trackId}"]`)
    if (competitorElement) {
      const checkbox = competitorElement.querySelector('input[type="checkbox"]')
      if (checkbox) checkbox.checked = false
    }

    this.updateReferencePointsOnMap()
  }

  async fetchPoints(trackId) {
    if (this.pointsCache.has(trackId)) {
      return this.pointsCache.get(trackId)
    }

    const params = new URLSearchParams({
      original_frequency: true,
      'trimmed[seconds_before_start]': 15,
      'trimmed[seconds_after_end]': 120
    })

    const response = await fetch(`/tracks/${trackId}/points?${params}`, {
      headers: { Accept: 'application/json' }
    })
    const data = await response.json()
    this.pointsCache.set(trackId, data)
    return data
  }

  createTrackGraphics(trackId, data, color) {
    const map = this.mapTarget.mapInstance
    if (!map) return

    const competitorElement = this.element.querySelector(`[data-track-id="${trackId}"]`)
    const exitedAt = competitorElement?.dataset.exitedAt

    const polylines = []
    const points = data.points || []
    const deployFlTime = data.deployFlTime

    if (points.length === 0) return

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

    const windowMarkers = this.createWindowMarkers(trackId, points)

    this.trackGraphics.set(trackId, { polylines, windowMarkers })
  }

  interpolatePointByAltitude(points, targetAltitude) {
    for (let i = 0; i < points.length - 1; i++) {
      const currentPoint = points[i]
      const nextPoint = points[i + 1]

      const isWithinRange =
        (currentPoint.altitude >= targetAltitude &&
          nextPoint.altitude <= targetAltitude) ||
        (currentPoint.altitude <= targetAltitude && nextPoint.altitude >= targetAltitude)

      if (isWithinRange) {
        if (currentPoint.altitude === targetAltitude) return currentPoint
        if (nextPoint.altitude === targetAltitude) return nextPoint

        const ratio =
          (targetAltitude - currentPoint.altitude) /
          (nextPoint.altitude - currentPoint.altitude)

        return {
          latitude:
            currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * ratio,
          longitude:
            currentPoint.longitude +
            (nextPoint.longitude - currentPoint.longitude) * ratio,
          altitude: targetAltitude
        }
      }
    }
  }

  createWindowMarkers(trackId, points) {
    const map = this.mapTarget.mapInstance
    if (!map || !this.windowStartValue || !this.windowEndValue) return []

    const windowStartPoint = this.interpolatePointByAltitude(
      points,
      this.windowStartValue
    )
    const windowEndPoint = this.interpolatePointByAltitude(points, this.windowEndValue)

    if (!windowStartPoint || !windowEndPoint) return []

    const bearing = this.calculateBearing(windowStartPoint, windowEndPoint)

    const startMarker = this.createWindowMarker(
      windowStartPoint,
      `${this.windowStartValue}m`,
      windowStartColor,
      bearing
    )

    const endMarker = this.createWindowMarker(
      windowEndPoint,
      `${this.windowEndValue}m`,
      windowEndColor,
      bearing
    )

    return [startMarker, endMarker]
  }

  calculateBearing(startPoint, endPoint) {
    const startCoordinate = new LatLon(startPoint.latitude, startPoint.longitude)
    const endCoordinate = new LatLon(endPoint.latitude, endPoint.longitude)

    return startCoordinate.initialBearingTo(endCoordinate)
  }

  createWindowMarker(point, text, color, bearing) {
    const map = this.mapTarget.mapInstance

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
        <text x="${textX}" y="${textY}" fill="white" font-family="Arial" font-size="12" font-weight="normal" filter="url(#shadow)" text-anchor="left">${text}</text>
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

  async handleReferencePointChange(event) {
    const select = event.target
    const competitorId = select.dataset.competitorId
    const roundId = select.dataset.roundId
    const referencePointId = select.value || null

    try {
      const response = await fetch(
        `/events/performance/${this.eventIdValue}/reference_point_assignments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
          },
          body: JSON.stringify({ roundId, competitorId, referencePointId })
        }
      )

      if (response.ok) {
        const competitorElement = select.closest('.lane-validation-competitor')
        if (competitorElement) {
          competitorElement.dataset.referencePointId = referencePointId || ''
          this.updateReferencePointsOnMap()
        }
      } else {
        console.error('Failed to update reference point assignment')
      }
    } catch (error) {
      console.error('Error updating reference point assignment:', error)
    }
  }

  updateReferencePointsOnMap() {
    this.referencePointMarkers.forEach(marker => {
      if (this.mapController && this.mapController.removeMarker) {
        this.mapController.removeMarker(marker)
      } else {
        marker.setMap(null)
      }
    })
    this.referencePointMarkers.clear()

    // Collect unique reference point IDs from displayed competitors
    const uniqueReferencePointIds = new Set()
    this.displayedCompetitors.forEach(trackId => {
      const competitorElement = this.element.querySelector(`[data-track-id="${trackId}"]`)
      if (competitorElement) {
        const referencePointId = competitorElement.dataset.referencePointId
        if (referencePointId) {
          uniqueReferencePointIds.add(referencePointId)
        }
      }
    })

    // Create markers only for unique reference points
    uniqueReferencePointIds.forEach(referencePointId => {
      const referencePoint = this.referencePoints.find(
        point => point.id == referencePointId
      )

      if (referencePoint && this.mapController) {
        this.mapController
          .createMarker(
            parseFloat(referencePoint.latitude),
            parseFloat(referencePoint.longitude),
            referencePoint.name,
            true
          )
          .then(marker => {
            this.referencePointMarkers.set(referencePointId, marker)
          })
      }
    })
  }

  get mapController() {
    return this.application.getControllerForElementAndIdentifier(this.mapTarget, 'map')
  }
}
