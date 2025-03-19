import { Controller } from '@hotwired/stimulus'
import initMapsApi from 'utils/google_maps_api'

export default class PlacesForm extends Controller {
  static targets = ['allPlaces', 'map', 'latitude', 'longitude']

  connect() {
    this.allPlaces = JSON.parse(this.allPlacesTarget.textContent)
    initMapsApi()
      .then(this.renderMap.bind(this))
      .then(this.onCoordinatesChange.bind(this))
  }

  renderMap() {
    const infoWindow = new google.maps.InfoWindow()

    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 9,
      center: new google.maps.LatLng(45, 6),
      mapTypeId: 'terrain',
      mapId: 'PLACE_FORM_MAP'
    })

    this.allPlaces.map(place => {
      const pin = new google.maps.marker.PinElement({
        scale: 0.8
      })

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: new google.maps.LatLng(place.latitude, place.longitude),
        map: this.map,
        title: place.name,
        content: pin.element,
        gmpClickable: true
      })

      marker.addListener('click', () => {
        infoWindow.close()
        infoWindow.setContent(marker.title)
        infoWindow.open(marker.map, marker)
      })
    })
  }

  onCoordinatesChange() {
    this.setCenter()
    this.updateMarker()
  }

  setCenter() {
    if (this.latitudeTarget.value && this.longitudeTarget.value) {
      this.map.setCenter({
        lat: parseFloat(this.latitudeTarget.value),
        lng: parseFloat(this.longitudeTarget.value)
      })
    }
  }

  updateMarker() {
    if (!this.marker) {
      const pin = new google.maps.marker.PinElement({
        scale: 1.2,
        background: '#5D3FD3',
        borderColor: '#FFFFFF',
        glyphColor: '#FFFFFF'
      })

      this.marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        content: pin.element
      })
    }

    if (this.latitudeTarget.value && this.longitudeTarget.value) {
      this.marker.position = {
        lat: parseFloat(this.latitudeTarget.value),
        lng: parseFloat(this.longitudeTarget.value)
      }
    }
  }
}
