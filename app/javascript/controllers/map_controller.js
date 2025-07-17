import { Controller } from '@hotwired/stimulus'
import initMapsApi from 'utils/google_maps_api'

export default class extends Controller {
  connect() {
    this.markers = []
    this.initMap = initMapsApi().then(() => this.renderMap())
    this.mapType = this.element.dataset.mapType || 'SATELLITE'
  }

  renderMap() {
    const options = {
      zoom: 13,
      mapTypeId: google.maps.MapTypeId[this.mapType],
      center: this.mapCenter,
      mapId: 'REFERENCE_POINTS_MAP'
    }

    this.element.mapInstance = new google.maps.Map(this.element, options)
  }

  createMarker(latitude, longitude, name, readOnly) {
    return this.initMap.then(() => {
      const pin = new google.maps.marker.PinElement({
        glyph: name,
        glyphColor: 'white'
      })
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        title: name,
        position: new google.maps.LatLng(latitude, longitude),
        content: pin.element,
        gmpDraggable: !readOnly
      })
      marker.pin = pin
      this.markers.push(marker)

      return marker
    })
  }

  removeMarker(marker) {
    marker.remove()
    this.markers = this.markers.filter(m => m !== marker)
  }

  get map() {
    return this.element.mapInstance
  }

  get mapCenter() {
    return new google.maps.LatLng(this.centerLatitude, this.centerLongitude)
  }

  get centerLatitude() {
    return Number(this.element.getAttribute('data-center-lat'))
  }

  get centerLongitude() {
    return Number(this.element.getAttribute('data-center-lon'))
  }
}
