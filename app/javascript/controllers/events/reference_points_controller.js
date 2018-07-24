import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'

export default class extends Controller {
  static targets = [ 'map', 'template', 'point' ]

  connect() {
    this.init_maps()
  }

  init_maps() {
    document.addEventListener('maps_api:ready', this.on_maps_ready, { once: true })
    document.addEventListener('maps_api:failed', this.on_maps_failed_load, { once: true })

    init_maps_api()
  }

  on_maps_ready = () => {
    this.maps_ready = true
    this.render_map()
  }

  render_map() {
    if (!this.maps_ready) return

    let options = {
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      center: this.map_center
    }

    this.mapTarget.map_instance = new google.maps.Map(this.mapTarget, options)

    this.draw_points()
  }

  draw_points() {
    this.point_rows.forEach( row => {
      let latitude_field  = row.querySelector('.reference-point__latitude')
      let longitude_field = row.querySelector('.reference-point__longitude')

      let latitude  = Number(latitude_field.value)
      let longitude = Number(longitude_field.value)

      if (latitude === 0 || longitude === 0) return

      row.marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: this.map,
        draggable: true
      })

      google.maps.event.addListener(row.marker, 'drag', () => {
        latitude_field.value  = Math.round(row.marker.getPosition().lat() * 1000000) / 1000000
        longitude_field.value = Math.round(row.marker.getPosition().lng() * 1000000) / 1000000
      })
    })
  }

  get map() {
    return this.mapTarget.map_instance
  }

  get map_center() {
    let latitude  = Number(this.mapTarget.getAttribute('data-center-lat'))
    let longitude = Number(this.mapTarget.getAttribute('data-center-lon'))

    return new google.maps.LatLng(latitude, longitude)
  }

  get point_rows() {
    return this.pointTargets
  }
}
