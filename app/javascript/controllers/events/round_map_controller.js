import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'

const START_POINT_COLOR      = '#ff1053'
const END_POINT_COLOR        = '#5FAD41'
const AFTER_EXIT_POINT_COLOR = '#124E78'

export default class extends Controller {
  static targets = [ 'map', 'loading_placeholder', 'competitor' ]

  initialize() {
    this.lines_by_competitor = {}
    this.reference_points = {}
  }

  connect() {
    init_maps_api()
    this.fetch_data()

    this.element.addEventListener('round-map-competitor-row:show-dl', this.show_dl_for_competitor.bind(this))
  }

  on_change_visibility(event) {
    const element = event.currentTarget
    const map_value = element.checked ? this.map : undefined
    const graphics = Object.values(this.lines_by_competitor[element.getAttribute('data-competitor-id')])
    graphics.forEach(item => item.setMap(map_value))
  }

  select_all(event) {
    event.currentTarget.blur()
    this.competitorTargets.forEach(item => this.change_check_state(item, true))
  }

  unselect_all(event) {
    event.currentTarget.blur()
    this.competitorTargets.forEach(item => this.change_check_state(item, false))
  }

  toggle_group(event) {
    const group = event.currentTarget
    const container = group.closest('.round-map-group')

    const has_unchecked = container.querySelectorAll('input:not(:checked)').length > 0
    const new_state = has_unchecked ? true : false

    container.querySelectorAll('input').forEach(item => this.change_check_state(item, new_state))
  }

  change_check_state(item, state) {
    const was_checked = item.checked
    item.checked = state
    if (was_checked !== item.checked) item.dispatchEvent(new Event('change'))
  }

  show_dl_for_competitor(original_event) {
    const { reference_point_id, competitor_id } = original_event.detail

    const reference_point_position = this.reference_points[reference_point_id].getPosition()

    let start_point_type = null
    if (this.designated_lane_start == 'designated_lane_start_on_enter_window') {
      start_point_type = 'start_point'
    } else {
      start_point_type = 'after_exit_point'
    }

    const start_point_position = this.lines_by_competitor[competitor_id][start_point_type].getPosition()

    const event = new CustomEvent('round-map:show-dl', {
      detail: {
        start_point_position: start_point_position,
        reference_point_position: reference_point_position
      },
      bubbles: true,
      cancelable: true
    })

    this.element.dispatchEvent(event)
  }

  fetch_data() {
    const url = this.element.getAttribute('data-url')

    fetch(url, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    })
      .then( response => { return response.json() })
      .then(this.on_data_ready)
  }

  on_maps_ready = () => {
    this.maps_ready = true
    this.render_map()
  }

  on_maps_failed_load = () => {
    this.maps_ready = false
    this.loading_placeholderTarget.innerHTML =
      '<i class="fa fa-3x fa-exclamation-triangle text-danger"></i>' +
      '<p>Failed to load Google Maps API.</p>'
  }

  on_data_ready = (data) => {
    this.map_data = data
    this.render_map()
  }

  render_map() {
    if (!this.maps_ready || !this.map_data) return

    const center = new google.maps.LatLng(
      this.map_data.place.latitude,
      this.map_data.place.longitude
    )

    const options = {
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: center
    }

    this.mapTarget.map_instance = new google.maps.Map(this.mapTarget, options)
    this.draw_round_map()
  }

  draw_round_map() {
    for (let competitor_data of this.map_data.competitors) {
      const polyline = this.draw_polyline(
        competitor_data.path_coordinates,
        competitor_data.color
      )

      const hover_polyline = this.draw_hover_polyline(
        competitor_data.path_coordinates,
        competitor_data.color,
        competitor_data.competitor_id
      )

      const start_point      = this.draw_point(competitor_data.start_point,      START_POINT_COLOR)
      const end_point        = this.draw_point(competitor_data.end_point,        END_POINT_COLOR)
      const after_exit_point = this.draw_point(competitor_data.after_exit_point, AFTER_EXIT_POINT_COLOR)

      this.lines_by_competitor[competitor_data.competitor_id] = {
        polyline: polyline,
        hover_polyline: hover_polyline,
        after_exit_point: after_exit_point,
        start_point: start_point,
        end_point: end_point
      }
    }

    this.draw_reference_points()

    this.resize()
  }

  draw_reference_points() {
    for (let reference_point of this.map_data.reference_points) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(reference_point.latitude, reference_point.longitude),
        map: this.map
      })

      this.reference_points[reference_point.id] = marker
    }
  }

  draw_polyline(path, color) {
    const polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3
    })

    polyline.setMap(this.map)

    return polyline
  }

  draw_hover_polyline(path, color, id) {
    const hover_polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 0.0001,
      strokeWeight: 15
    })

    hover_polyline.setMap(this.map)

    google.maps.event.addListener(hover_polyline, 'mouseover', () => {
      document
        .querySelectorAll(`.round-map-competitor[data-competitor-id="${id}"]`)
        .forEach(el => el.style.backgroundColor = '#BCE7FD')
    })

    google.maps.event.addListener(hover_polyline, 'mouseout', () => {
      document
        .querySelectorAll(`.round-map-competitor[data-competitor-id="${id}"]`)
        .forEach(el => el.style.backgroundColor = 'transparent')
    })

    return hover_polyline
  }

  draw_point(position, color) {
    return new google.maps.Marker({
      position: position,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeWeight: 5,
        strokeColor: color,
        fillColor: color,
        fillOpacity: 1
      },
      map: this.map
    })
  }

  resize() {
    if (!this.map || !this.bounds) return

    google.maps.event.trigger(this.map, 'resize')
    this.map.fitBounds(this.bounds)
    this.map.setCenter(this.bounds.getCenter())
  }

  get bounds() {
    if (!this.map_data) return undefined
    if (this._bounds) return this._bounds

    const competitor_data = this.map_data.competitors

    const start_lats = competitor_data.map(el => el.start_point.lat )
    const start_lons = competitor_data.map(el => el.start_point.lng )
    const end_lats   = competitor_data.map(el => el.end_point.lat )
    const end_lons   = competitor_data.map(el => el.end_point.lng )

    const lat_bounds = start_lats.concat(end_lats)
    const lon_bounds = start_lons.concat(end_lons)

    lat_bounds.sort()
    lon_bounds.sort()

    const bounds = new google.maps.LatLngBounds()

    bounds.extend(new google.maps.LatLng(
      Number(lat_bounds[0]),
      Number(lon_bounds[0])
    ))

    bounds.extend(new google.maps.LatLng(
      Number(lat_bounds[lat_bounds.length - 1]),
      Number(lon_bounds[lon_bounds.length - 1])
    ))

    this._bounds = bounds
    return this._bounds
  }

  get designated_lane_start() {
    return this.element.getAttribute('data-dl-start')
  }

  get map() {
    return this.mapTarget.map_instance
  }
}
