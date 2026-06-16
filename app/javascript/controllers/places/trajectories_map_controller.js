import { Controller } from '@hotwired/stimulus'
import { get } from '@rails/request.js'
import initMapsApi from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'

export default class extends Controller {
  static targets = ['map']
  static values = { url: String, latitude: Number, longitude: Number }

  connect() {
    Promise.all([initMapsApi(), this.loadTrajectories()])
      .then(() => this.render())
      .catch(() => this.hide())
  }

  async loadTrajectories() {
    const response = await get(this.urlValue, { responseKind: 'json' })
    const data = await response.json
    this.trajectories = Array.isArray(data) ? data : []
  }

  render() {
    if (this.trajectories.length === 0) {
      this.hide()
      return
    }

    this.initMap()
    this.renderTrajectories()
  }

  hide() {
    this.element.hidden = true
  }

  initMap() {
    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 14,
      center: { lat: this.latitudeValue, lng: this.longitudeValue },
      mapTypeId: 'terrain'
    })
  }

  renderTrajectories() {
    const allPoints = []

    this.trajectories.forEach(points => {
      if (!points.length) return
      this.drawTrajectory(points)
      allPoints.push(...points)
    })

    this.fitBounds(allPoints)
  }

  drawTrajectory(points) {
    const trajectory = new Trajectory(points)

    for (const { path, color } of trajectory.polylines) {
      new google.maps.Polyline({
        path,
        strokeColor: color,
        strokeOpacity: 0.5,
        strokeWeight: 3,
        map: this.map
      })
    }
  }

  fitBounds(points) {
    if (!points.length) return

    const bounds = new Bounds(points)
    const mapBounds = new google.maps.LatLngBounds()

    mapBounds.extend({ lat: bounds.minLatitude, lng: bounds.minLongitude })
    mapBounds.extend({ lat: bounds.maxLatitude, lng: bounds.maxLongitude })

    this.map.fitBounds(mapBounds)
  }
}
