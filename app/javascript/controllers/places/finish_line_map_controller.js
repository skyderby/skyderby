import { Controller } from 'stimulus'
import Geospatial from 'utils/geospatial'
import init_maps_api from 'utils/google_maps_api'

export default class extends Controller {
  static targets = [
    'map',
    'finish_start_lat',
    'finish_start_lon',
    'finish_end_lat',
    'finish_end_lon',
    'center_lat',
    'center_lon',
    'exit_lat',
    'exit_lon',
    'length',
    'distance'
  ]

  connect() {
    this.init_maps()
    this.set_center()
    this.set_length()
    this.set_distance()
  }

  on_change_place(event) {
    const place_id = event.currentTarget.value
    fetch(`/places/${place_id}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        this.exit_lat = data.latitude
        this.exit_lon = data.longitude
        this.on_change_exit()
      })
  }

  on_change_exit() {
    this.set_distance()
    this.render_map()
  }

  on_change_finish_line_center() {
    this.set_distance()
    this.calculate_finish_line_coordinates()
    this.render_map()
  }

  on_change_length() {
    this.calculate_finish_line_coordinates()
    this.render_map()
  }

  on_change_finish_line_coordinates() {
    this.set_center()
    this.set_length()
    this.set_distance()
    this.render_map()
  }

  calculate_finish_line_coordinates() {
    const bearing = Geospatial.bearing(
      this.exit_lat,
      this.exit_lon,
      this.center_lat,
      this.center_lon
    )
    const start_point = Geospatial.destiantion_by_bearing_and_distance(
      this.center_lat,
      this.center_lon,
      bearing + 90,
      this.length / 2
    )

    this.finish_start_lat = start_point.latitude
    this.finish_start_lon = start_point.longitude

    const end_point = Geospatial.destiantion_by_bearing_and_distance(
      this.center_lat,
      this.center_lon,
      bearing - 90,
      this.length / 2
    )

    this.finish_end_lat = end_point.latitude
    this.finish_end_lon = end_point.longitude
  }

  init_maps() {
    document.addEventListener('maps_api:ready', this.on_maps_ready, { once: true })
    init_maps_api()
  }

  set_center() {
    this.center_lat =
      this.finish_start_lat + (this.finish_end_lat - this.finish_start_lat) / 2
    this.center_lon =
      this.finish_start_lon + (this.finish_end_lon - this.finish_start_lon) / 2
  }

  set_length() {
    this.length = Geospatial.distance(
      this.finish_start_lat,
      this.finish_start_lon,
      this.finish_end_lat,
      this.finish_end_lon
    ).toFixed()
  }

  set_distance() {
    this.distance = Geospatial.distance(
      this.exit_lat,
      this.exit_lon,
      this.center_lat,
      this.center_lon
    )
  }

  on_maps_ready = () => {
    const options = {
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: google.maps.MapTypeId.SATELLITE
    }

    this.mapTarget.map_instance = new google.maps.Map(this.mapTarget, options)

    this.render_map()
  }

  render_map() {
    if (!this.map) return

    this.render_finish_line()
    this.render_center_line()
    this.fit_bounds()
  }

  render_finish_line() {
    if (this.finish_line) this.finish_line.setMap(null)

    if (!this.finish_line_coordinates_present) return

    this.finish_line = new google.maps.Polyline({
      path: [
        { lat: this.finish_start_lat, lng: this.finish_start_lon },
        { lat: this.finish_end_lat, lng: this.finish_end_lon }
      ],
      geodesic: true,
      strokeColor: '#E84855',
      strokeOpacity: 1.0,
      strokeWeight: 2
    })

    this.finish_line.setMap(this.map)
  }

  render_center_line() {
    if (this.center_line) this.center_line.setMap(null)
    if (!this.finish_line_coordinates_present || !this.exit_coordinates_present) return

    this.center_line = new google.maps.Polyline({
      path: [
        { lat: this.center_lat, lng: this.center_lon },
        { lat: this.exit_lat, lng: this.exit_lon }
      ],
      geodesic: true,
      strokeColor: '#E84855',
      strokeOpacity: 1.0,
      strokeWeight: 2
    })

    this.center_line.setMap(this.map)
  }

  fit_bounds() {
    const bounds = new google.maps.LatLngBounds()

    if (this.finish_start_lat && this.finish_start_lon) {
      bounds.extend(new google.maps.LatLng(this.finish_start_lat, this.finish_start_lon))
    }

    if (this.finish_end_lat && this.finish_end_lon) {
      bounds.extend(new google.maps.LatLng(this.finish_end_lat, this.finish_end_lon))
    }

    if (this.exit_lat && this.exit_lon) {
      bounds.extend(new google.maps.LatLng(this.exit_lat, this.exit_lon))
    }

    this.map.fitBounds(bounds)
    this.map.setCenter(bounds.getCenter())
  }

  // Attributes

  get finish_line_coordinates_present() {
    return (
      this.finish_start_lat &&
      this.finish_start_lon &&
      this.finish_end_lat &&
      this.finish_end_lon
    )
  }

  get exit_coordinates_present() {
    return this.exit_lat && this.exit_lon
  }

  get center_lat() {
    return Number(this.center_latTarget.value)
  }

  set center_lat(value) {
    this.center_latTarget.innerText = value
    this.center_latTarget.value = value
  }

  get center_lon() {
    return Number(this.center_lonTarget.value)
  }

  set center_lon(value) {
    this.center_lonTarget.innerText = value
    this.center_lonTarget.value = value
  }

  get finish_start_lat() {
    return Number(
      this.finish_start_latTarget.value || this.finish_start_latTarget.innerText
    )
  }

  set finish_start_lat(value) {
    this.finish_start_latTarget.value = value
  }

  get finish_start_lon() {
    return Number(
      this.finish_start_lonTarget.value || this.finish_start_lonTarget.innerText
    )
  }

  set finish_start_lon(value) {
    this.finish_start_lonTarget.value = value
  }

  get finish_end_lat() {
    return Number(this.finish_end_latTarget.value || this.finish_end_latTarget.innerText)
  }

  set finish_end_lat(value) {
    this.finish_end_latTarget.value = value
  }

  get finish_end_lon() {
    return Number(this.finish_end_lonTarget.value || this.finish_end_lonTarget.innerText)
  }

  set finish_end_lon(value) {
    this.finish_end_lonTarget.value = value
  }

  get exit_lat() {
    return Number(this.exit_latTarget.value || this.exit_latTarget.innerText)
  }

  set exit_lat(value) {
    this.exit_latTarget.value = value
  }

  get exit_lon() {
    return Number(this.exit_lonTarget.value || this.exit_lonTarget.innerText)
  }

  set exit_lon(value) {
    this.exit_lonTarget.value = value
  }

  get length() {
    return Number(this.lengthTarget.value)
  }

  set length(value) {
    this.lengthTarget.innerText = `${value} ${I18n.t('units.m')}`
    this.lengthTarget.value = value
  }

  set distance(value) {
    this.distanceTarget.innerText = `${value.toFixed()} ${I18n.t('units.m')}`
  }

  get map() {
    return this.mapTarget.map_instance
  }
}
