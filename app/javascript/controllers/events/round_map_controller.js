import { Controller } from 'stimulus'
import init_maps_api from 'utils/google_maps_api'
import DesignatedLane from 'services/designated_lane'

export default class extends Controller {
  static targets = [
    'map',
    'competitor',
    'designated_lane_length',
    'designated_lane_width',
    'designated_lane_direction'
  ]

  initialize() {
    this.lines_by_competitor = {}
  }

  connect() {
    this.init_maps()
    this.fetch_data()
  }

  on_change_visibility(event) {
    let element = event.currentTarget
    let map_value = element.checked ? this.map : undefined
    let graphics = this.lines_by_competitor[element.id]
    graphics.forEach( (item) => { item.setMap(map_value) } )
  }

  select_all(event) {
    event.currentTarget.blur()
    this.competitorTargets.forEach( (item) => { this.change_check_state(item, true) } )
  }

  unselect_all(event) {
    event.currentTarget.blur()
    this.competitorTargets.forEach( (item) => { this.change_check_state(item, false) } )
  }

  toggle_group(event) {
    let group = event.currentTarget
    let tbody = group.closest('tbody')

    let has_unchecked = tbody.querySelectorAll('input:not(:checked)').length > 0
    let new_state = has_unchecked ? true : false

    tbody.querySelectorAll('input').forEach( (item) => { this.change_check_state(item, new_state) } )
  }

  toggle_designated_lane(event) {
    let button = event.currentTarget
    button.blur()
    button.classList.toggle('active')

    if (button.classList.contains('active')) {
      this.enable_designated_lane()
    } else {
      this.disable_designated_lane()
    }
  }

  on_change_designated_lane_length(event) {
    let length = Number(event.currentTarget.value)

    this.designated_lane.set_length(length)
  }

  on_change_designated_lane_width(event) {
    let width = Number(event.currentTarget.value)

    this.designated_lane.set_width(width)
  }

  on_change_designated_lane_direction(event) {
    let direction = Number(event.currentTarget.value)

    this.designated_lane.set_direction(direction)
  }

  enable_designated_lane() {
    this.designated_lane_lengthTarget.disabled = false
    this.designated_lane_widthTarget.disabled = false
    this.designated_lane_directionTarget.disabled = false

    let lane_length = this.designated_lane_lengthTarget.value,
      lane_width = this.designated_lane_widthTarget.value,
      lane_direction = this.designated_lane_directionTarget.value
     
    if (!this.designated_lane) {
      this.designated_lane = new DesignatedLane(
        google,
        this.map,
        lane_width,
        lane_length,
        lane_direction,
        { on_rotate: (angle) => { this.designated_lane_directionTarget.value = angle } }
      )
    }

    this.designated_lane.show()
  }

  disable_designated_lane() {
    this.designated_lane_lengthTarget.disabled = true
    this.designated_lane_widthTarget.disabled = true
    this.designated_lane_directionTarget.disabled = true

    this.designated_lane.hide()
  }

  change_check_state(item, state) {
    let was_checked = item.checked
    item.checked = state 
    if (was_checked !== item.checked) item.dispatchEvent(new Event('change'))
  }

  init_maps() {
    document.addEventListener('maps_api:ready', this.on_maps_ready, { once: true })
    init_maps_api()
  }

  fetch_data() {
    let url = this.element.getAttribute('data-url')
    fetch(url, { credentials: 'same-origin',
                 headers: { 'Accept': 'application/json' } })
      .then( response => { return response.json() })
      .then(this.on_data_ready)
  }

  on_maps_ready = () => {
    this.maps_ready = true
    this.render_map()
  }

  on_data_ready = (data) => {
    this.map_data = data
    this.render_map()
  }

  render_map() {
    if (!this.maps_ready || !this.map_data) return

    let options = {
      'zoom': 2,
      'mapTypeId': google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapTarget, options)
    this.draw_round_map()
  }

  draw_round_map() {
    for (let competitor_data of this.map_data) {
      let polyline = this.draw_polyline(
        competitor_data.path_coordinates,
        competitor_data.color
      )
      
      let hover_polyline = this.draw_hover_polyline(
        competitor_data.path_coordinates,
        competitor_data.color,
        competitor_data.id
      )

      let start_point = this.draw_start_point(competitor_data.start_point)
      let end_point = this.draw_end_point(competitor_data.end_point) 
      
      this.lines_by_competitor['competitor_' + competitor_data.id] =
        [ polyline, hover_polyline, start_point, end_point ]
    }

    this.resize()
  }

  draw_polyline(path, color) {
    let polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3
    })

    polyline.setMap(this.map)

    return polyline
  }

  draw_hover_polyline(path, color, id) {
    let hover_polyline = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 0.0001,
      strokeWeight: 15
    })

    hover_polyline.setMap(this.map)

    google.maps.event.addListener(hover_polyline, 'mouseover', (e) => {
      document.querySelector(`input#competitor_${id}`).closest('tr').style.backgroundColor = '#BCE7FD'
    })

    google.maps.event.addListener(hover_polyline, 'mouseout', (e) => {
      document.querySelector(`input#competitor_${id}`).closest('tr').style.backgroundColor = 'transparent'
    })

    return hover_polyline
  }

  draw_start_point(position) {
    let start_point = new google.maps.Marker({
      position: position,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeWeight: 5,
        fillColor: '#ff1053',
        strokeColor: '#ff1053',
        fillOpacity: 1
      },
      map: this.map
    })

    return start_point
  }

  draw_end_point(position) {
    let end_point = new google.maps.Marker({
      position: position,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeWeight: 5,
        fillColor: '#5FAD41',
        strokeColor: '#5FAD41',
        fillOpacity: 1
      },
      map: this.map
    })

    return end_point
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

    let start_lats = this.map_data.map( (el) => { return el.start_point.lat } )
    let start_lons = this.map_data.map( (el) => { return el.start_point.lng } )
    let end_lats   = this.map_data.map( (el) => { return el.end_point.lat   } )
    let end_lons   = this.map_data.map( (el) => { return el.end_point.lng   } )

    let lat_bounds = start_lats.concat(end_lats)
    let lon_bounds = start_lons.concat(end_lons)

    lat_bounds.sort()
    lon_bounds.sort()

    let bounds = new google.maps.LatLngBounds()

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
}
