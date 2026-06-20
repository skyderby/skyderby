import Trajectory from 'utils/tracks/map/trajectory'
import Bounds from 'utils/maps/bounds'
import { LOCATION_ARROW_PATH } from 'utils/tracks/locationArrowPath'

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
    if (!this.marker || !this.markerElement) return

    this.marker.position = { lat: point.latitude, lng: point.longitude }

    if (heading !== undefined) {
      this.markerElement.style.transform = `translateY(50%) rotate(${heading - 45}deg)`
    }
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

    if (this.marker) {
      this.marker.map = null
    }

    this.markerElement = this.buildMarkerElement()

    this.marker = new google.maps.marker.AdvancedMarkerElement({
      map: this._map,
      position: { lat: firstPoint.latitude, lng: firstPoint.longitude },
      content: this.markerElement
    })
  }

  buildMarkerElement() {
    if (this.markerColor) {
      const wrapper = document.createElement('div')
      wrapper.style.width = '24px'
      wrapper.style.height = '24px'
      wrapper.style.transform = 'translateY(50%) rotate(-45deg)'
      wrapper.innerHTML =
        '<svg viewBox="0 0 640 640" width="24" height="24">' +
        `<path fill="${this.markerColor}" d="${LOCATION_ARROW_PATH}"/></svg>`
      return wrapper
    }

    const img = document.createElement('img')
    img.src = this.markerImageUrl
    img.style.width = '24px'
    img.style.height = '24px'
    img.style.transform = 'translateY(50%) rotate(-45deg)'
    return img
  }
}
