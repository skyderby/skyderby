import { Controller } from 'stimulus'
import initMapsApi from 'utils/google_maps_api'
import handleRemote from 'utils/handle_remote'
import MarkerClusterer from '@google/markerclusterer'

export default class extends Controller {
  static targets = ['map', 'place', 'country', 'preview', 'previewLoading']

  connect() {
    initMapsApi()
  }

  onMapsReady() {
    this.initMap()
    this.renderMap()
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

  initMap() {
    this.map = new google.maps.Map(this.mapTarget, this.mapsOptions)
  }

  renderMap() {
    const markers = this.places.map(({ element, position }) => {
      const marker = new google.maps.Marker({ position: position })
      google.maps.event.addListener(marker, 'click', () => handleRemote(element))

      return marker
    })

    new MarkerClusterer(this.map, markers, {
      gridSize: 50,
      maxZoom: 6,
      imagePath: '/markerclusterer/m'
    })
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

  get mapsOptions() {
    return {
      zoom: 3,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain'
    }
  }
}
