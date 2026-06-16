import { Controller } from '@hotwired/stimulus'
import { get } from '@rails/request.js'
import initMapsApi from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'

const DEFAULT_STYLE = { strokeOpacity: 0.9, strokeWeight: 3 }
const HOVER_STYLE = { strokeOpacity: 1, strokeWeight: 5 }

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

    this.trajectories.forEach(trajectory => {
      if (!trajectory.points.length) return
      this.drawTrajectory(trajectory)
      allPoints.push(...trajectory.points)
    })

    this.fitBounds(allPoints)
  }

  drawTrajectory(trajectory) {
    const { polylines } = new Trajectory(trajectory.points)

    const segments = polylines.map(
      ({ path, color }) =>
        new google.maps.Polyline({
          path,
          strokeColor: color,
          ...DEFAULT_STYLE,
          map: this.map
        })
    )

    segments.forEach(segment => {
      segment.addListener('click', () => Turbo.visit(trajectory.url))
      segment.addListener('mouseover', () => this.highlight(segments, true))
      segment.addListener('mouseout', () => this.highlight(segments, false))
    })
  }

  highlight(segments, active) {
    segments.forEach(segment => segment.setOptions(active ? HOVER_STYLE : DEFAULT_STYLE))
    this.map.setOptions({ draggableCursor: active ? 'pointer' : null })
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
