import { Controller } from '@hotwired/stimulus'
import initMapsApi from 'utils/google_maps_api'

export default class extends Controller {
  connect() {
    this.initMap = initMapsApi().then(() => this.renderMap())
  }

  remove(e) {
    e.preventDefault()

    const tr = e.currentTarget.closest('tr')
    tr.querySelector('input[name$="[_destroy]"]').value = true
    tr.style.display = 'none'

    tr.marker.setMap(null)
  }

  add(e) {
    e.preventDefault()
    const template = this.template.split('__INDEX__').join(this.child_index())
    this.container.insertAdjacentHTML('beforeend', template)

    const new_row = this.container.querySelector('tr:last-child')
    new_row.querySelector('.reference-point__latitude').value = this.center_latitude
    new_row.querySelector('.reference-point__longitude').value = this.center_longitude
    this.create_marker(new_row)
  }

  child_index() {
    return new Date().getTime()
  }

  renderMap() {
    const options = {
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      center: this.mapCenter,
      mapId: 'REFERENCE_POINTS_MAP'
    }

    this.element.mapInstance = new google.maps.Map(this.element, options)

    // this.draw_points()
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

      return marker
    })
  }

  draw_points() {
    this.point_rows.forEach(row => {
      this.create_marker(row)
    })
  }

  create_marker(row) {
    const latitude_field = row.querySelector('.reference-point__latitude')
    const longitude_field = row.querySelector('.reference-point__longitude')

    const latitude = Number(latitude_field.value)
    const longitude = Number(longitude_field.value)

    if (latitude === 0 || longitude === 0) return

    row.marker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      map: this.map,
      draggable: true
    })

    google.maps.event.addListener(row.marker, 'drag', () => {
      latitude_field.value =
        Math.round(row.marker.getPosition().lat() * 1000000) / 1000000
      longitude_field.value =
        Math.round(row.marker.getPosition().lng() * 1000000) / 1000000
    })
  }

  get map() {
    return this.element.mapInstance
  }

  get mapCenter() {
    return new google.maps.LatLng(this.center_latitude, this.center_longitude)
  }

  get center_latitude() {
    return Number(this.element.getAttribute('data-center-lat'))
  }

  get center_longitude() {
    return Number(this.element.getAttribute('data-center-lon'))
  }

  get point_rows() {
    return this.pointTargets
  }

  get container() {
    return this.containerTarget
  }

  get template() {
    return this.templateTarget.innerHTML
  }
}
