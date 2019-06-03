import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'
import MarkerClusterer from '@google/markerclusterer'

export default class extends Controller {
  static targets = ['map', 'place', 'country', 'preview', 'previewLoading']

  connect() {
    init_maps_api()
  }

  on_maps_ready() {
    this.init_map()
    this.render_map()
  }

  before_request_preview() {
    this.previewTarget.classList.add('visible')
  }

  close_preview() {
    this.previewTarget.classList.remove('visible')
    setTimeout(() => {
      this.previewLoadingTarget.style.visibility = 'visible'
    }, 300)
  }

  request_preview_success() {
    this.previewLoadingTarget.style.visibility = 'hidden'
  }

  request_preview_error() {}

  init_map() {
    this.map = new google.maps.Map(this.mapTarget, this.maps_options)
  }

  render_map() {
    const markers = this.places.map(place => {
      const marker = new google.maps.Marker({ position: place.position })
      google.maps.event.addListener(marker, 'click', () => {
        Rails.fire(place.element, 'click')
      })

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

  get maps_options() {
    return {
      zoom: 3,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: 'terrain'
    }
  }
}
