import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['referencePoints', 'map']

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
}
