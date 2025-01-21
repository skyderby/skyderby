import { Controller } from 'stimulus'
import initMapsApi from 'utils/google_maps_api'
import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'

export default class extends Controller {
  static targets = ['map', 'data']

  connect() {
    this.mapData = JSON.parse(this.dataTarget.textContent)
    initMapsApi()
  }

  renderMap() {
    if (!this.mapsReady || !this.mapData) return

    this.drawTrajectory(this.mapData.points, { strokeOpacity: 1, strokeWeight: 6 })
    this.drawTrajectory(this.mapData.zerowindPoints, {
      strokeOpacity: 0.4,
      strokeWeight: 7
    })

    this.fitBounds()
  }

  drawTrajectory(points, opts) {
    const trajectory = new Trajectory(points)

    for (let { path, color } of trajectory.polylines) {
      this.createPolyline(path, color, opts)
    }
  }

  createPolyline(path, color, opts) {
    const polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      ...opts
    })

    polyline.setMap(this.map)
  }

  fitBounds() {
    const bounds = new Bounds(this.mapData.points)
    const mapBounds = new google.maps.LatLngBounds()

    mapBounds.extend(new google.maps.LatLng(bounds.minLatitude, bounds.minLongitude))
    mapBounds.extend(new google.maps.LatLng(bounds.maxLatitude, bounds.maxLongitude))

    this.map.fitBounds(mapBounds)
    this.map.setCenter(mapBounds.getCenter())
  }

  onMapsReady() {
    this.mapsReady = true
    this.initMap()
    this.renderMap()
  }

  initMap() {
    this.map = new google.maps.Map(this.mapTarget, this.mapsOptions)
  }

  get mapsOptions() {
    return {
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain'
    }
  }
}
