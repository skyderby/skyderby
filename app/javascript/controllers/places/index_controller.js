import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'
import MarkerClusterer from '@google/markerclusterer'

export default class extends Controller {
  static targets = [ 'map', 'place', 'country' ]

  connect() {
    init_maps_api()
  }

  on_maps_ready() {
    this.init_map()
    this.render_map()
  }

  filter_places(event) {
    const term = event.target.value

    if (term === '') {
      this.show_countries()
      this.show_all_places()
      return
    }

    this.hide_countries()

    if (this.timer_id) clearTimeout(this.timer_id)
    this.timer_id = setTimeout(() => this.filter_places_by_term(term), 100)
  }

  show_countries() {
    this.countryTargets.forEach( el => el.style.display = 'block' )
  }

  hide_countries() {
    this.countryTargets.forEach( el => el.style.display = 'none' )
  }

  show_all_places() {
    this.placeTargets.forEach( el => el.style.display = 'block' )
  }

  filter_places_by_term(term) {
    this.placeTargets.forEach( el => {
      el.style.display = el.innerText.toLowerCase().indexOf(term.toLowerCase()) === -1 ? 'none' : 'block'
    })
  }

  init_map() {
    this.map = new google.maps.Map(this.mapTarget, this.maps_options)
  }

  render_map() {
    const markers = this.places.map ( place => {
      const marker = new google.maps.Marker({ position: place.position })
      google.maps.event.addListener(marker, 'click', () => { this.handle_click_on_marker(place.id) })

      return marker
    })

    new MarkerClusterer(
      this.map,
      markers,
      {
        gridSize: 50,
        maxZoom: 6,
        imagePath: '/markerclusterer/m'
      }
    )
  }

  get places() {
    if (!this._places) {
      this._places = this.placeTargets.map( el => {
        return {
          id: Number(el.getAttribute('data-id')),
          name: el.innerText,
          position: {
            lat: Number(el.getAttribute('data-lat')),
            lng: Number(el.getAttribute('data-lon'))
          }
        }
      })
    }

    return this._places
  }

  get maps_options() {
    return {
      'zoom': 3,
      'center': new google.maps.LatLng(20, 20),
      'mapTypeId': 'terrain'
    }
  }
}
