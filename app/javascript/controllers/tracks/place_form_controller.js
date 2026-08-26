import { Controller } from '@hotwired/stimulus'
import { get } from '@rails/request.js'
import throttle from 'lodash.throttle'
import initMapsApi from 'utils/google_maps_api'

const COUNTRY_LOOKUP_INTERVAL = 5000

export default class extends Controller {
  static targets = ['map', 'latitude', 'longitude', 'country']
  static values = { draggable: Boolean, countriesUrl: String }

  connect() {
    this.lookupCountry = throttle(this.lookupCountry.bind(this), COUNTRY_LOOKUP_INTERVAL)

    initMapsApi()
      .then(this.renderMap.bind(this))
      .then(() => {
        if (!this.countryTarget.value) this.lookupCountry()
      })
      .catch(() => {})
  }

  disconnect() {
    this.lookupCountry.cancel()
  }

  get position() {
    const latitude = parseFloat(this.latitudeTarget.value)
    const longitude = parseFloat(this.longitudeTarget.value)

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null

    return { lat: latitude, lng: longitude }
  }

  renderMap() {
    const position = this.position
    if (!position) return

    this.map = new google.maps.Map(this.mapTarget, {
      zoom: 15,
      center: position,
      mapTypeId: 'hybrid',
      mapId: 'TRACK_PLACE_FORM_MAP'
    })

    this.marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      map: this.map,
      gmpDraggable: this.draggableValue
    })

    if (this.draggableValue) {
      this.marker.addListener('dragend', this.onMarkerDrag.bind(this))
    }
  }

  onMarkerDrag(event) {
    this.latitudeTarget.value = event.latLng.lat().toFixed(7)
    this.longitudeTarget.value = event.latLng.lng().toFixed(7)
    this.lookupCountry()
  }

  lookupCountry() {
    const position = this.position
    if (!position) return

    new google.maps.Geocoder()
      .geocode({ location: position })
      .then(({ results }) => this.countryNameFrom(results))
      .then(name => (name ? this.findCountry(name) : null))
      .catch(() => {})
  }

  countryNameFrom(results) {
    for (const result of results) {
      const component = result.address_components.find(item =>
        item.types.includes('country')
      )
      if (component) return component.long_name
    }

    return null
  }

  async findCountry(name) {
    const response = await get(this.countriesUrlValue, {
      query: { term: name },
      responseKind: 'json'
    })
    if (!response.ok) return

    const data = await response.json
    const country = data?.results?.[0]
    if (country) this.selectCountry(country)
  }

  selectCountry({ id, text }) {
    const select = this.countryTarget

    if (!select.querySelector(`option[value="${id}"]`)) {
      select.add(new Option(text, id))
    }

    select.value = id
    select.dispatchEvent(new Event('change'))

    if (!this.draggableValue) this.lockCountry()
  }

  lockCountry() {
    this.countryTarget
      .closest('.hot-select-container')
      ?.classList.add('hot-select-container--locked')
  }
}
