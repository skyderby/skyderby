import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'
import ArrowMarker from 'utils/tracks/playback/ArrowMarker'

const toLatLng = points =>
  points.map(p => ({ latitude: p.latitude, longitude: p.longitude, hSpeed: p.hSpeed }))

export default class TrackMap {
  constructor({ element, mapId, markerColor = null, markerImageUrl = null }) {
    this.element = element
    this.mapId = mapId
    this.markerColor = markerColor
    this.markerImageUrl = markerImageUrl
    this.polylines = []
  }

  get map() {
    return this._map
  }

  render(fullPoints, windowPoints) {
    if (!this._map) this.initMap()

    this.clearPolylines()
    this.drawSegment(fullPoints, 3, 0.7)
    this.drawSegment(windowPoints, 5, 1)
    this.fitBounds(fullPoints)
    this.createMarker(fullPoints[0])
  }

  setPosition(point, heading) {
    this.marker?.setPosition(point, heading)
  }

  initMap() {
    this._map = new google.maps.Map(this.element, {
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain',
      mapId: this.mapId,
      cameraControl: false,
      streetViewControl: false,
      zoomControl: true
    })
  }

  clearPolylines() {
    this.polylines.forEach(p => p.setMap(null))
    this.polylines = []
  }

  drawSegment(points, strokeWeight, strokeOpacity) {
    if (!points || points.length < 2) return

    const trajectory = new Trajectory(toLatLng(points))

    for (let { path, color } of trajectory.polylines) {
      const polyline = new google.maps.Polyline({
        path,
        strokeColor: color,
        strokeOpacity,
        strokeWeight
      })
      polyline.setMap(this._map)
      this.polylines.push(polyline)
    }
  }

  fitBounds(points) {
    if (!points || points.length === 0) return

    const bounds = new Bounds(toLatLng(points))
    const mapBounds = new google.maps.LatLngBounds()

    mapBounds.extend(new google.maps.LatLng(bounds.minLatitude, bounds.minLongitude))
    mapBounds.extend(new google.maps.LatLng(bounds.maxLatitude, bounds.maxLongitude))

    this._map.fitBounds(mapBounds)
    this._map.setCenter(mapBounds.getCenter())
  }

  createMarker(firstPoint) {
    if (!firstPoint) return

    this.marker?.remove()
    this.marker = new ArrowMarker({
      map: this._map,
      position: firstPoint,
      color: this.markerColor,
      imageUrl: this.markerImageUrl
    })
  }
}
