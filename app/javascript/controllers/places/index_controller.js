import { Controller } from 'stimulus'
import initMapsApi from 'utils/google_maps_api'
import handleRemote from 'utils/handle_remote'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

export default class extends Controller {
  static targets = ['map', 'place', 'country', 'preview', 'previewLoading']

  connect() {
    initMapsApi().then(() => this.renderMap())
  }

  beforeRequestPreview() {
    this.previewTarget.classList.add('visible')
  }

  close_preview() {
    this.previewTarget.classList.remove('visible')
    setTimeout(() => {
      this.previewLoadingTarget.style.visibility = 'visible'
    }, 300)
  }

  requestPreviewSuccess() {
    this.previewLoadingTarget.style.visibility = 'hidden'
  }

  requestPreviewError() {}

  renderMap() {
    const infoWindow = new google.maps.InfoWindow()

    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 3,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain',
      mapId: 'PLACES_INDEX_MAP'
    })

    const markers = this.places.map(place => {
      const pin = new google.maps.marker.PinElement()
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        title: place.name,
        position: place.position,
        content: pin.element
      })
      marker.addListener('click', () => {
        infoWindow.close()
        infoWindow.setContent(`<a href="/places/${place.id}">${marker.title}</a>`)
        infoWindow.open(marker.map, marker)
      })

      return marker
    })

    new MarkerClusterer({ map: this.map, markers })
  }

  get places() {
    if (!this._places) {
      this._places = this.placeTargets.map(el => ({
        id: Number(el.getAttribute('data-id')),
        name: el.innerText,
        position: {
          lat: Number(el.getAttribute('data-lat')),
          lng: Number(el.getAttribute('data-lon'))
        },
        element: el
      }))
    }

    return this._places
  }
}
