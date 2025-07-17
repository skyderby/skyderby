import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['referencePoints', 'map']
  static values = { eventId: Number }

  connect() {
    this.pointsCache = new Map()
    this.polylines = new Map()
    this.referencePointMarkers = new Map()
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

    if (checkbox.checked) {
      this.displayGroup(groupId)
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
      this.displayTrack(trackId, color)
    })
  }

  clearAllTracks() {
    this.polylines.forEach(polyline => polyline.setMap(null))
    this.polylines.clear()

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
    if (this.polylines.has(trackId)) return

    try {
      const points = await this.fetchPoints(trackId)
      this.createPolyline(trackId, points, color)
      this.updateReferencePointsOnMap()
    } catch (error) {
      console.error(`Failed to load track ${trackId}:`, error)
    }
  }

  removeTrack(trackId) {
    const polyline = this.polylines.get(trackId)
    if (polyline) {
      polyline.setMap(null)
      this.polylines.delete(trackId)
    }

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

    const response = await fetch(`/tracks/${trackId}/points`, {
      headers: { Accept: 'application/json' }
    })
    const data = await response.json()
    this.pointsCache.set(trackId, data.points)
    return data.points
  }

  createPolyline(trackId, points, color) {
    const map = this.mapTarget.mapInstance
    if (!map) return

    const path = points.map(point => ({
      lat: point.latitude,
      lng: point.longitude
    }))

    const polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeWeight: 3,
      strokeOpacity: 1.0
    })

    polyline.setMap(map)
    this.polylines.set(trackId, polyline)
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

    const displayedCompetitors = this.element.querySelectorAll(
      '.lane-validation-competitor input[type="checkbox"]:checked'
    )

    displayedCompetitors.forEach(checkbox => {
      const competitorElement = checkbox.closest('.lane-validation-competitor')
      const referencePointId = competitorElement.dataset.referencePointId

      if (referencePointId) {
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
              this.referencePointMarkers.set(
                `${competitorElement.dataset.trackId}-${referencePointId}`,
                marker
              )
            })
        }
      }
    })
  }

  get mapController() {
    return this.application.getControllerForElementAndIdentifier(this.mapTarget, 'map')
  }
}
